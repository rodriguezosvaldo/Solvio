import React, { useEffect, useState, useCallback, useContext } from "react";
import CategoryAndValue from "../home/CategoryAndValue";
import AccountsByType from "./AccountsByType";
import AddAccount from "./AddAccount";
import supabase_client from "../../supabase/client";
import DefineCategory from "./DefineCategory";
import Papa from "papaparse";
import { SolvioContext } from "../../context/SolvioContext";
import { GoogleGenAI } from "@google/genai";


const Accounts = () => {
  
  // const [expenseCategories, setExpenseCategories] = useState([]); // This is for the AI prompt
  // const [incomeCategories, setIncomeCategories] = useState([]); // This is for the AI prompt
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDefineCategory, setShowDefineCategory] = useState(false);
  const [bankStatement, setBankStatement] = useState({ accountId: null, data: [] });
  const [AIloading, setAIloading] = useState(false);
  const { transactionsInDatabase, categoriesInDatabase, userId, setRefreshTransactions, balanceByAccountLastMonthInDatabase, setRefreshAccounts, assetsLastMonthInDatabase, liabilitiesLastMonthInDatabase, totalLastMonthInDatabase } = useContext(SolvioContext);

  // Making sure that the bankStatement is not empty before showing the DefineCategory component
  useEffect(() => {
    if (bankStatement.data.length > 0) {
      setShowDefineCategory(true);  
      setAIloading(false);
    }
  }, [bankStatement]);

  // useCallback is used to prevent the function from being recreated on every render. Especially when the function is passed as a prop to a child component.
  const processCSV = useCallback((accountId, accountType, file, categoriesInDatabase, transactionsInDatabase) => {
    setAIloading(true);
    // Parsing the CSV file using Papa Parse library to get the bank statement in an array of objects
    Papa.parse(file, {
      header: true, // Assume that the first row is the header
      skipEmptyLines: true,
      // When parsing is done the function inside complete is executed
      complete: async function (results) {
        // This is temporal only for Capital One Credit and Debit
        // TO-DO: Implement the logic for other banks and account types (Maybe using case-switch)
        if (accountType === "credit") {
          const formattedBankStatement = await formatingCapitalOneCredit(accountId, results.data, categoriesInDatabase, transactionsInDatabase);
          setBankStatement({ accountId, accountType, data: formattedBankStatement });
        } 
        if (accountType === "debit") {
          const formattedBankStatement = await formatingCapitalOneDebit(accountId, results.data, categoriesInDatabase, transactionsInDatabase);
          setBankStatement({ accountId, accountType, data: formattedBankStatement });
        }
      },
    });
  }, []);
  

  // Parse bankStatement.data from different banks to obtain a standard format
  // Format needed:
  // bankStatement.data[0] = {
  //   "Date": "2025-07-08",
  //   "Description": "SUPERMERCADO GUANAJUAT",
  //   "Amount": "14.68",
  //   "AI Suggested Category": "(One of the categories in the database)"}


  // Format the date to YYYY-MM-DD, this is the format that most databases use including Supabase
  const formatDate_YYYY_MM_DD = (date) => {
    const dateObject = new Date(date); // Convert the date to a Date object only if date has a format recognized by javascript
    //if dateObject is not a valid date, 
    if (isNaN(dateObject)) {
      return console.log("Invalid DATE+++++++++++++++++++++++++++++++++", date);
    } else {
    // Format the date to YYYY-MM-DD
      const yyyy = dateObject.getFullYear();
      const mm = String(dateObject.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so we add 1 to get 1-12
      const dd = String(dateObject.getDate()).padStart(2, '0'); // same as getMonth()
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      return formattedDate;
    }
  };

  const defineCategory = async (accountId, date, description, amount, transactionsInDatabase) => {

    // Define if the transaction is a transfer between accounts
    const baseDate = new Date(date);
    const startDateObj = new Date(baseDate);
    startDateObj.setDate(baseDate.getDate() - 5);
    const endDateObj = new Date(baseDate);
    endDateObj.setDate(baseDate.getDate() + 5);

    const startDate = startDateObj.toISOString().split('T')[0]; // transforms date Object to an ISO string (example: 2025-07-16T00:00:00.000Z) 
    const endDate = endDateObj.toISOString().split('T')[0];     // and then splits it using the T separator to get the date in the format "YYYY-MM-DD".

    const transfer = transactionsInDatabase.filter(transaction => {
      // Check for transactions in the range of 5 days before and after the date of the transaction
      // with the same description and amount, and different account_id (not the same account)
      // If there is a transaction in a different account with the same description and amount,
      // in the same period of time, it is very likely to be a transfer between accounts
      transaction.date >= startDate && transaction.date <= endDate && transaction.description === description && transaction.account_id !== accountId;
    });
    if (transfer.length > 0 && amount > 0) {
      console.log("transferIn++++++FOUND+++"); // Debugging++++++++++++++++
      console.log("transfer++++++", transfer); // Debugging++++++++++++++++
      return "transferIn";
    } else if (transfer.length > 0 && amount < 0) {
      console.log("transferOut++++++FOUND+++"); // Debugging++++++++++++++++
      console.log("transfer++++++", transfer); // Debugging++++++++++++++++
      return "transferOut";
    } else {
      // Before using the AI, check if in the database are transactions with the same description
      // in the last 6 months. If there are, use the most common category as a suggested category.
      // If there are no transactions with the same description in the last 6 months, use the AI to define the category.
      const baseDate = new Date(date);
      const startDateObj = new Date(baseDate);
      startDateObj.setMonth(baseDate.getMonth() - 6);
      const startDate = startDateObj.toISOString().split('T')[0];

      const transactionsInRange = transactionsInDatabase.filter(transaction => {
        transaction.date >= startDate && transaction.description === description;
      });
      if (transactionsInRange.length > 0) {
        // Get the most common category
        const categories = [];
        transactionsInRange.forEach(transaction => {
            categories.push(transaction.category);
          });
          const count = {};
          let maxCategory = null;
          let maxCount = 0;
          for (const category of categories) {
            count[category] = (count[category] || 0) + 1;
            if (count[category] > maxCount) {
              maxCount = count[category];
              maxCategory = category;
            }
          }
          console.log("CATEGORY REPEATED FOUND++++++"); // Debugging++++++++++++++++
          console.log("maxCategory++++++", maxCategory); // Debugging++++++++++++++++
          return maxCategory;
      } else {
        // If there are no transactions in range of 6 months, use set category to "AI" to be defined later using AI
        return "Choose a category";
      }
    }
  };

  const defineCategoryAI = async (formattedBankStatement, categoriesInDatabase) => {
    // Get transactions whose category needs to be defined by the AI
    const transactionsNeedingAI = formattedBankStatement.filter(transaction => transaction.Category === "Choose a category");

    if (transactionsNeedingAI.length > 0) {
      // Getting just the id, amount and description of the transactions to send them to the AI in a clear format
      const formattedForAI = transactionsNeedingAI.map(transaction => {
        return {
          id : transaction.id,
          amount : transaction.Amount,
          description : transaction.Description,
        }
      });

      const getJSONforAI = (formattedForAI, categoriesInDatabase) => {
        // Getting expense and transferOut categories, transactions with amount < 0, and specific prompt for these data
        const expense = categoriesInDatabase.filter(category => category.categoryType === "expense");
        const transferOut = categoriesInDatabase.filter(category => category.category === "transferOut");
        const expenseCategory = [...expense, ...transferOut];
        const expenseCategoryList = expenseCategory.map(category => category.category);
        const expenseTransactions = formattedForAI.filter(transaction => transaction.amount < 0);
        const expensePrompt = `You are a financial expert. Given the following transactions, analize the description of each transaction and assign them the most appropriate category from the provided categories list. Return each of the transaction id with the category assigned. Return only the JSON array, with no additional text.
        Example response:
        [
          {id: 1, category: "groceries"},
          {id: 2, category: "transportation"},
          {id: 3, category: "clothing"},
          {id: 4, category: "transferOut"},
          {id: 5, category: "groceries"},
        ]
        `;

        // Getting income and transferIn categories, transactions with amount > 0, and specific prompt for these data
        const income = categoriesInDatabase.filter(category => category.categoryType === "income");
        const transferIn = categoriesInDatabase.filter(category => category.category === "transferIn");
        const incomeCategory = [...income, ...transferIn];
        const incomeCategoryList = incomeCategory.map(category => category.category);
        const incomeTransactions = formattedForAI.filter(transaction => transaction.amount > 0);
        const incomePrompt = `You are a financial expert. Given the following transactions, analize the description of each transaction and assign them the most appropriate category from the provided categories list. Return each of the transaction id with the category assigned. Return only the JSON array, with no additional text.
        Example response:
        [
          {id: 1, category: "salary"},
          {id: 2, category: "investments"},
          {id: 3, category: "transferIn"},
          {id: 4, category: "salary"},
          {id: 5, category: "transferIn"},
        ]
        `;

        const expenseFormat = {
          expensePrompt : expensePrompt,
          expenseCategories : expenseCategoryList,
          expenseTransactions : expenseTransactions,
        } 

        const incomeFormat = {
          incomePrompt : incomePrompt,
          incomeCategories : incomeCategoryList,
          incomeTransactions : incomeTransactions,
        } 
        const finalPrompt = 'Finally, combine the results of the two prompts in a single JSON array. Return only the JSON array, with no additional text.';
        const formatforAI = {...incomeFormat, ...expenseFormat, finalPrompt};
        const JSONforAI = JSON.stringify(formatforAI);
        return JSONforAI;
      };
      const JSONforAI = getJSONforAI(formattedForAI, categoriesInDatabase);

      // Sending data to AI
      const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_API_KEY});
      async function main(JSONforAI) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: JSONforAI,
        });
        let rawResponse = response.text;
        rawResponse = rawResponse.replace(/```json|```/g, ""); // Remove the ```json and ``` from the response (/g is a global flag, so it will replace all occurrences)
        const AIResponse = JSON.parse(rawResponse);
        return AIResponse;
      }
      
      const AIcategories = await main(JSONforAI);
      AIcategories.map(AIcategory => {
        formattedBankStatement.forEach(transaction => {
          if (transaction.id === AIcategory.id) {
            transaction.Category = AIcategory.category;
          }
        });
      });
      return formattedBankStatement;
    } else {
      console.log("No transactions needing AI+++++++++");
      return formattedBankStatement;
    }
  };

  const formatingCapitalOneCredit= async (accountId, bankStatement, categoriesInDatabase, transactionsInDatabase) => {
    // Capital One Credit Card bankStatement format:             
    // Card No.: "5678"
    // Category: "Merchandise"
    // Credit: ""  // If it is an expense, the credit is empty
    // Debit: "14.68" // If it is an income, the debit is empty
    // Description: "SUPERMERCADO GUANAJUAT"
    // Posted Date: "2025-07-08"
    // Transaction Date: "2025-07-07"

    // Format the date to YYYY-MM-DD
    bankStatement.forEach(transaction => {
      transaction["Posted Date"] = formatDate_YYYY_MM_DD(transaction["Posted Date"]);
    });
    // Format the bankStatement and get the category for each transaction
    const formattedBankStatement = await Promise.all(
      bankStatement.map(async (transaction, index) => ({
        id: index,
        Date: transaction["Posted Date"],
        Description: transaction["Description"],
        Amount: transaction["Debit"] === "" ? transaction["Credit"] : -transaction["Debit"],
        Category: await defineCategory(
          accountId,
          transaction["Posted Date"],
          transaction["Description"],
          transaction["Debit"] === "" ? transaction["Credit"] : -transaction["Debit"],
          categoriesInDatabase,
          transactionsInDatabase
        ),
      }))
    );
    const bankStatementReady = await defineCategoryAI(formattedBankStatement, categoriesInDatabase);
    return bankStatementReady;
  };

  const formatingCapitalOneDebit= async (accountId, bankStatement, categoriesInDatabase, transactionsInDatabase) => {
    // Capital One Debit Card bankStatement format:
    // Account Number: "1234"
    // Balance: "65.79"
    // Transaction Amount: "50"
    // Transaction Date: "07/06/25"
    // Transaction Description: "Debit Card Purchase - SUNTRUST BANK ATLANTA GA"
    // Transaction Type: "Debit"

    // Format the date to YYYY-MM-DD
    bankStatement.forEach(transaction => {
      transaction["Transaction Date"] = formatDate_YYYY_MM_DD(transaction["Transaction Date"]);
    });

    // Format the bankStatement and get the category for each transaction
    const formattedBankStatement = await Promise.all(
      bankStatement.map(async (transaction, index) => ({
        id: index,
        Date: transaction["Transaction Date"],
        Description: transaction["Transaction Description"],
        Amount: transaction["Transaction Type"] === "Debit" ? -transaction["Transaction Amount"] : transaction["Transaction Amount"],
        Category: await defineCategory(
          accountId,
          transaction["Transaction Date"],
          transaction["Transaction Description"],
          transaction["Transaction Type"] === "Debit" ? -transaction["Transaction Amount"] : transaction["Transaction Amount"],
          categoriesInDatabase,
          transactionsInDatabase
        ),
      }))
    );
    const bankStatementReady = await defineCategoryAI(formattedBankStatement, categoriesInDatabase);
    return bankStatementReady;
  };

  const deleteAccount = useCallback(async (accountId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account?"
    );
    if (!confirmed) return;

    const { error } = await supabase_client
      .from("accounts")
      .update({ is_active: false })
      .eq("id", accountId);
    if (error) {
      console.log(error);
    } else {
      setRefreshAccounts(true);
    }
  }, []);

  const renderingAccountsByType = () => {
    if (balanceByAccountLastMonthInDatabase.length === 0) {
      return (
        <div className="flex w-full h-full justify-center items-center text-white">
          No accounts found
        </div>
      );
    } else {
      const typeCash = balanceByAccountLastMonthInDatabase.filter(account => account.accountType === "cash");
      const typeDebit = balanceByAccountLastMonthInDatabase.filter(account => account.accountType === "debit");
      const typeCredit = balanceByAccountLastMonthInDatabase.filter(account => account.accountType === "credit");
      const typeSavings = balanceByAccountLastMonthInDatabase.filter(account => account.accountType === "savings");
      const accountsByType = [typeCash, typeDebit, typeCredit, typeSavings];
      return accountsByType.map(accountType => {
        if (accountType.length > 0) {
          // Get the total balance of the account type (Sum of all balances of the accounts with the same type)
          const totalBalance = accountType.map(account => account.totalBalance).reduce((sum, balance) => sum + balance, 0); 
          return <AccountsByType
                    key={accountType[0].accountId}
                    type={accountType[0].accountType}
                    totalbalance={totalBalance}
                    accounts={accountType}
                    deleteAccount={deleteAccount}
                    processCSV={processCSV}
                    categoriesInDatabase={categoriesInDatabase}
                    transactionsInDatabase={transactionsInDatabase}
                  />
        }
      });
    }
  }

  const addAccount = useCallback(() => {
    setShowAddForm(true);
  }, []);

  // If showAddForm is true, render the AddAccount component
  if (showAddForm) {
    return (
      <AddAccount
        leaveAddAccount={() => setShowAddForm(false)}
        userId={userId}
        setRefreshAccounts={setRefreshAccounts}
      />
    );
  }

  // If showDefineCategory is true, render the DefineCategory component
  if (showDefineCategory) {
    return (
      <DefineCategory
        userId={userId}
        accountId={bankStatement.accountId}
        bankStatement={bankStatement.data}
        categoriesInDatabase={categoriesInDatabase}
        transactionsInDatabase={transactionsInDatabase}
        leaveDefineCategory={() => {
          setShowDefineCategory(false);
          setRefreshTransactions(true);
        }}
      />
    );
  }
  //
  // If AIloading is true, render the AIloading component
  const renderAIloading = () => {
    if (AIloading) {
      return (
        <div className="fixed top-0 left-0 z-50 w-full h-full flex flex-col gap-8 justify-center items-center text-white bg-transparent backdrop-blur-sm">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#9CA3AF"
              className="w-25 h-25 animate-pulsing animate-duration-[2s] [animation-iteration-count:infinite]">
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M20.5 9a3.49 3.49 0 0 0-3.45 3h-1.1a2.49 2.49 0 0 0-4.396-1.052L8.878 9.731l3.143-4.225a2.458 2.458 0 0 0 2.98-.019L17.339 8H16v1h3V6h-1v1.243l-2.336-2.512A2.473 2.473 0 0 0 16 3.5a2.5 2.5 0 0 0-5 0 2.474 2.474 0 0 0 .343 1.243L7.947 9.308 4.955 7.947a2.404 2.404 0 0 0-.161-1.438l3.704-1.385-.44 1.371.942.333L10 4 7.172 3l-.334.943 1.01.357-3.659 1.368a2.498 2.498 0 1 0-.682 4.117l2.085 2.688-2.053 2.76a2.5 2.5 0 1 0 .87 3.864l3.484 1.587-1.055.373.334.943L10 21l-1-2.828-.943.333.435 1.354-3.608-1.645A2.471 2.471 0 0 0 5 17.5a2.5 2.5 0 0 0-.058-.527l3.053-1.405 3.476 4.48a2.498 2.498 0 1 0 4.113.075L18 17.707V19h1v-3h-3v1h1.293l-2.416 2.416a2.466 2.466 0 0 0-2.667-.047l-3.283-4.23 2.554-1.176A2.494 2.494 0 0 0 15.95 13h1.1a3.493 3.493 0 1 0 3.45-4zm-7-7A1.5 1.5 0 1 1 12 3.5 1.502 1.502 0 0 1 13.5 2zm0 18a1.5 1.5 0 1 1-1.5 1.5 1.502 1.502 0 0 1 1.5-1.5zM1 7.5a1.5 1.5 0 1 1 2.457 1.145l-.144.112A1.496 1.496 0 0 1 1 7.5zm3.32 1.703a2.507 2.507 0 0 0 .264-.326l2.752 1.251-1.124 1.512zM2.5 19A1.5 1.5 0 1 1 4 17.5 1.502 1.502 0 0 1 2.5 19zm2.037-2.941a2.518 2.518 0 0 0-.193-.234l1.885-2.532 1.136 1.464zm3.76-1.731L6.849 12.46l1.42-1.908L11.1 11.84a2.29 2.29 0 0 0-.033 1.213zM13.5 14a1.5 1.5 0 1 1 1.5-1.5 1.502 1.502 0 0 1-1.5 1.5zm7 1a2.5 2.5 0 1 1 2.5-2.5 2.502 2.502 0 0 1-2.5 2.5zm1.5-2.5a1.5 1.5 0 1 1-1.5-1.5 1.502 1.502 0 0 1 1.5 1.5z"></path>
                <path fill="none" d="M0 0h24v24H0z"></path>
              </g>
            </svg>
        </div>
      );
    } else {
      return null;
    }
  }

  // Otherwise render the accounts list
  return (
    <>
      {renderAIloading()}
      <div className="flex flex-col w-full p-4 gap-4 text-white overflow-y-auto rounded-3xl animate-blurred-fade-in duration-300">
        <button
          className="bg-green-700 flex sm:w-10 sm:h-10 w-7 h-7 self-end justify-center items-center rounded-2xl hover:scale-105 transition-all duration-300"
          onClick={addAccount}
        >
          +
        </button>
        <div className="flex gap-2 w-full mb-4 justify-around items-center">
          <CategoryAndValue label="Assets" value={assetsLastMonthInDatabase} color='green'/>
          <CategoryAndValue label="Liabilities" value={liabilitiesLastMonthInDatabase} color='red'/>
          <CategoryAndValue label="Total" value={totalLastMonthInDatabase}/>
        </div>
        <div className="flex flex-col gap-8 w-full overflow-y-auto">
          {renderingAccountsByType()}
        </div>
      </div>
    </>
  );
};
export default Accounts;

import React, { useEffect, useState, useCallback } from "react";
import CategoryAndValue from "../home/CategoryAndValue";
import AccountsByType from "./AccountsByType";
import AddAccount from "./AddAccount";
import supabase_client from "../../supabase/client";
import DefineCategory from "./DefineCategory";
import Papa from "papaparse";



const Accounts = ({ userId }) => {
  const [accounts, setAccounts] = useState([]);
  const [categoriesInDatabase, setCategoriesInDatabase] = useState([]);
  // const [expenseCategories, setExpenseCategories] = useState([]); // This is for the AI prompt
  // const [incomeCategories, setIncomeCategories] = useState([]); // This is for the AI prompt
  const [transactionsInDatabase, setTransactionsInDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDefineCategory, setShowDefineCategory] = useState(false);
  const [bankStatement, setBankStatement] = useState({ accountId: null, data: [] });

  //Getting all accounts from the Accounts table to show in the Accounts component
  // This useEffect is executed only once when the component is mounted because the array of dependencies is empty
  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase_client
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .eq("user_id", userId);
      if (error) {
        setError(error.message);
        console.log(error);
      } else {
        setAccounts(data);
      }
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  // Getting all categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase_client
        .from("categories")
        .select("id, category, type");
      if (error) {
        console.log(error);
      } else {
        // Make a list of categories to show in the AI prompt. Example: "Groceries"
        // This is a good way to show the data to the AI in a more readable format
        const categories = {expense: [], income: [] };
        const arrayCategoriesInDatabase = [];
        data.map(categoryAndType => {
          arrayCategoriesInDatabase.push({category_id: categoryAndType.id, category: categoryAndType.category});
          if (categoryAndType.type === "expense") {
            categories.expense.push(categoryAndType.category);
          } else {
            categories.income.push(categoryAndType.category);
          }
        });
        // setExpenseCategories(categories.expense.join(", ")); // It is a better format for the AI prompt
        // setIncomeCategories(categories.income.join(", ")); // It is a better format for the AI prompt
        setCategoriesInDatabase(arrayCategoriesInDatabase); 
      }
    };
    fetchCategories();
  }, []); 

  // Getting all transactions in the database
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase_client
        .from("transactions")
        .select("*, categories(category)")
        .eq("user_id", userId);
      if (error) {
        console.log(error)
        setError(error)
      } else {
        // This .select("*, categories(category)") returns all of the columns of the transactions table
        // and the category column of the categories table as a nested object, so we need to extract the category
        // to obtain more clean data
        data.forEach(transaction => {
          transaction.category = transaction.categories.category;
          delete transaction.categories;
        });
        setTransactionsInDatabase(data);
      }
    };
    fetchTransactions();
  }, []);

  // Making sure that the bankStatement is not empty before showing the DefineCategoryAndType component
  useEffect(() => {
    if (bankStatement.data.length > 0) {
      setShowDefineCategory(true);
    }
  }, [bankStatement]);

  // Calculations for assets, liabilities, and total
  const assets = accounts
    .filter((acc) => acc.balance >= 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  const liabilities =
    accounts
      .filter((acc) => acc.balance < 0)
      .reduce((sum, acc) => sum + acc.balance, 0) * -1;
  const total = assets - liabilities;

  //Getting props for AccountsbyType
  const typeCash = accounts.filter((account) => account.type === "cash");
  const typeDebit = accounts.filter((account) => account.type === "debit");
  const typeCredit = accounts.filter((account) => account.type === "credit");
  const typeSavings = accounts.filter((account) => account.type === "savings");

  // useCallback is used to prevent the function from being recreated on every render. Especially when the function is passed as a prop to a child component.
  const processCSV = useCallback((accountId, accountType, file) => {
    console.log("Processing CSV+++++++++++++++++++++++++++++++++");
    // Parsing the CSV file using Papa Parse library to get the bank statement in an array of objects
    Papa.parse(file, {
      header: true, // Assume that the first row is the header
      skipEmptyLines: true,
      // When parsing is done the function inside complete is executed
      complete: async function (results) {
        // This is temporal only for Capital One Credit and Debit
        // TO-DO: Implement the logic for other banks and account types (Maybe using case-switch)
        if (accountType === "credit") {
          const formattedBankStatement = await formatingCapitalOneCredit(accountId, results.data);
          console.log("formattedBankStatement+++++++++++++++++++++++++++++++++", formattedBankStatement);
          setBankStatement({ accountId, accountType, data: formattedBankStatement });
        } else if (accountType === "debit") {
          const formattedBankStatement = formatingCapitalOneDebit(results.data);
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

  // The AI suggested category is not used because it is not working as expected. I need more time to explore
  // the best way and models to use the AI...
  // const AIsuggestedCategory = async (description, amount) => {
  //   // Use the AI to define the category
  //   //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //   //MODIFICAR ESTO USANDO EDGE FUNCTIONS DE SUPABASE ++++++++++++++++++++++++++++++++++
  //   const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
  //   const ai = new GoogleGenAI({apiKey}); 
  //   // PARA USAR LA API KEY DE GEMINI DESDE SUPABASE Y ASI NO EXPONERLA AL CLIENTE ++++++++++++++++++++++++++++++++++
  //   //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //   let prompt = ``;
  //   if (amount < 0) {
  //     prompt = `
  //     You are a financial expert. Given a transaction, your task is to assign the most appropriate category from the provided list.
  //     Transaction details:
  //     - Description: ${description}
  //     - Categories: ${expenseCategories}
  //     Instructions:
  //     - Choose only from the categories provided. Do not choose a category that is not in the list.
  //     - Analyze the description for keywords to help determine the correct category, for example,
  //     words like supermarket are usually related to the groceries category;
  //     words like gas, Thorntons, Speedway, Circle K are usually related to transportation category;
  //     words like Ross, Burlington, Mall are usually related to the clothing category;
  //     - Make your response choosing only the category name, with no extra text, punctuation, or explanation.
  //     - I repeat, do not choose a category that is not in the list. My life depends on it. Never give a blank response.
  //     Example response:
  //     groceries
  //     `;
  //   } else {
  //     prompt = `
  //     You are a financial expert. Given a transaction, your task is to assign the most appropriate category from the provided list.
  //     Transaction details:
  //     - Description: ${description}
  //     - Categories: ${incomeCategories}
  //     Instructions:
  //     - Choose only from the categories provided. Do not choose a category that is not in the list.
  //     - Analyze the description for keywords to help determine the correct category, for example,
  //     words like deposit and received are usually related to the salary or other category;
  //     - Make your response choosing only the category name, with no extra text, punctuation, or explanation.
  //     - I repeat, do not choose a category that is not in the list. My life depends on it. Never give a blank response.
  //     Example response:
  //     salary
  //     `;
  //   }
  //   // Using Gemini API
  //   async function main() {
  //     const response = await ai.models.generateContent({
  //       model: "gemini-2.5-flash",
  //       contents: prompt,
  //     });
  //     return response.text;
  //   }
  //   const categoryAI = await main();
  //   categoryAI.toLowerCase();
  //   console.log("AI suggested category+++++++++++++++++++++++++++++++++", categoryAI);
  //   if (categoriesInDatabase.includes(categoryAI.trim())) {
  //     return categoryAI.trim();
  //   } else {
  //     return "choose a category";
  //   }
  // };
  

  const defineCategory = async (accountId, date, description, amount) => {
    // Define if the transaction is a transfer between accounts
    const baseDate = new Date(date);
    const startDateObj = new Date(baseDate);
    startDateObj.setDate(baseDate.getDate() - 5);
    const endDateObj = new Date(baseDate);
    endDateObj.setDate(baseDate.getDate() + 5);

    const startDate = startDateObj.toISOString().split('T')[0]; // transforms date Object to an ISO string (example: 2025-07-16T00:00:00.000Z) 
    const endDate = endDateObj.toISOString().split('T')[0];     // and then splits it using the T separator to get the date in the format "YYYY-MM-DD"

    // NOTA: Aqui estaba teniendo un problema porque la AI sugeria en este punto hacer una consulta
    // a Supabase para obtener todas las transacciones y seleccionar un rango de fechas para comparar
    // descripcion y amount y definir la categoria. 
    // El problema es que defineCategory es llamada desde bankStatement.map lo que hace que por cada
    // transaccion se haga una consulta a Supabase.
    // Para solucionar esto primero se obtienen todas las transacciones de la base de datos usando un useEffect
    // que se ejecuta cada vez que se monta el componente.

    const transfer = transactionsInDatabase.filter(transaction => {
      // Check for transactions in the range of 5 days before and after the date of the transaction
      // with the same description and amount, and different account_id (not the same account)
      // If there is a transaction in a different account with the same description and amount,
      // in the same period of time, it is very likely to be a transfer between accounts
      transaction.date >= startDate && transaction.date <= endDate && transaction.description === description && transaction.account_id !== accountId;
    });
    if (transfer.length > 0) {
      return "transfer";
    } else {
      // Before using the AI, check if in the database there are transactions with the same description
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
          console.log("maxCategory+++++++++++++++++++++++++++++++++", maxCategory);
          return maxCategory;
      } else {
        console.log("No transactions in range of 6 months, have to use AI+++++++++++++++++++++++++++++++++");
        return "choose a category"; // This is a temporary solution to avoid using the AI
      }
    }
  };
  
  const formatingCapitalOneCredit= async (accountId, bankStatement) => {
    // Capital One Credit Card bankStatement format:             
    // Card No.: "5678"
    // Category: "Merchandise"
    // Credit: ""  // If it is an expense, the credit is empty
    // Debit: "14.68" // If it is an income, the debit is empty
    // Description: "SUPERMERCADO GUANAJUAT"
    // Posted Date: "2025-07-08"
    // Transaction Date: "2025-07-07"

    console.log("formatingCapitalOneCredit+++++++++++++++++++++++++++++++++");
    // Format the date to YYYY-MM-DD
    bankStatement.forEach(transaction => {
      transaction["Posted Date"] = formatDate_YYYY_MM_DD(transaction["Posted Date"]);
    });
    // Format the bankStatement and get the category for each transaction
    const formattedBankStatement = await Promise.all(
      bankStatement.map(async transaction => ({
        Date: transaction["Posted Date"],
        Description: transaction["Description"],
        Amount: transaction["Debit"] === "" ? transaction["Credit"] : -transaction["Debit"],
        Category: await defineCategory(
          accountId,
          transaction["Posted Date"],
          transaction["Description"],
          transaction["Debit"] === "" ? transaction["Credit"] : -transaction["Debit"]
        ),
      }))
    );
    return formattedBankStatement;
  };

  const formatingCapitalOneDebit= (bankStatement) => {
    // Capital One Debit Card bankStatement format:
    // Account Number: "1234"
    // Balance: "65.79"
    // Transaction Amount: "50"
    // Transaction Date: "07/06/25"
    // Transaction Description: "Debit Card Purchase - SUNTRUST BANK ATLANTA GA"
    // Transaction Type: "Debit"
    const formattedBankStatement = bankStatement.map(transaction => ({
      Date: formatDate_YYYY_MM_DD(transaction["Transaction Date"]),
      Description: transaction["Transaction Description"],
      Amount: transaction.transactionType === "Debit" ? -transaction["Transaction Amount"] : transaction["Transaction Amount"],
      Category: defineCategory(formatDate_YYYY_MM_DD(transaction["Transaction Date"]), transaction["Transaction Description"], transaction.transactionType === "Debit" ? -transaction["Transaction Amount"] : transaction["Transaction Amount"]),
    }));
    return formattedBankStatement;
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
      setAccounts(prevAccounts => prevAccounts.filter((account) => account.id !== accountId));
    }
  }, []);

  const beforeRenderingAccounts = () => {
    if (loading)
      return (
        <div className="w-full h-full flex justify-center items-center text-white">
          Loading accounts...
        </div>
      );
    if (error)
      return (
        <div className="w-full h-full flex justify-center items-center text-white">
          Error: {error}
        </div>
      );
    else if (!typeCash && !typeCredit && !typeDebit && !typeSavings) {
      return (
        <div className="w-full h-full flex justify-center items-center text-white">
          No accounts found
        </div>
      );
    }
  };

  const renderingAccountsByType = (accountType) => {
    if (accountType.length > 0) {
      const totalBalance = accountType.reduce(
        (sum, acc) => sum + acc.balance,
        0
      );
      return (
        <AccountsByType
          type={accountType[0].type}
          totalbalance={totalBalance}
          accounts={accountType}
          deleteAccount={deleteAccount}
          processCSV={processCSV}
        />
      );
    }
  };

  const addAccount = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const updatingAccounts = useCallback((newAccount) => {
    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
  }, []);

  // If showAddForm is true, render the AddAccount component
  if (showAddForm) {
    return (
      <AddAccount
        leaveAddAccount={() => setShowAddForm(false)}
        newAccount={updatingAccounts}
        userId={userId}
      />
    );
  }

  // If showDefineCategory is true, render the DefineCategoryAndType component
  if (showDefineCategory) {
    return (
      <DefineCategory
        userId={userId}
        accountId={bankStatement.accountId}
        bankStatement={bankStatement.data}
        categoriesInDatabase={categoriesInDatabase}
        leaveDefineCategory={() => setShowDefineCategory(false)}
      />
    );
  }

  // Otherwise render the accounts list
  return (
    <div className="flex flex-col gap-8 text-white p-6 w-full overflow-y-auto border-2 border-yellow-500 rounded-3xl">
      <button
        className="bg-green-700 flex w-10 h-10 self-end justify-center items-center rounded-2xl"
        onClick={addAccount}
      >
        +
      </button>
      <div className="flex gap-2 w-full justify-around items-center">
        <CategoryAndValue label="Assets" value={assets} />
        <CategoryAndValue label="Liabilities" value={liabilities} />
        <CategoryAndValue label="Total" value={total} />
      </div>
      <div className="flex flex-col gap-4 w-full overflow-y-auto border-2 border-yellow-500 rounded-3xl">
        {beforeRenderingAccounts()}
        {renderingAccountsByType(typeCash)}
        {renderingAccountsByType(typeCredit)}
        {renderingAccountsByType(typeDebit)}
        {renderingAccountsByType(typeSavings)}
      </div>
    </div>
  );
};
export default Accounts;
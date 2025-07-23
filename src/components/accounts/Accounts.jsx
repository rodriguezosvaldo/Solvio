import React, { useEffect, useState, useCallback } from "react";
import CategoryAndValue from "../home/CategoryAndValue";
import AccountsByType from "./AccountsByType";
import AddAccount from "./AddAccount";
import supabase_client from "../../supabase/client";
import DefineCategory from "./DefineCategory";
import Papa from "papaparse";



const Accounts = ({ userId }) => {
  const [accounts, setAccounts] = useState([]);
  const [typeCash, setTypeCash] = useState([[], 0]); // [accounts, balance]
  const [typeDebit, setTypeDebit] = useState([[], 0]);
  const [typeCredit, setTypeCredit] = useState([[], 0]);
  const [typeSavings, setTypeSavings] = useState([[], 0]);
  const [categoriesInDatabase, setCategoriesInDatabase] = useState([]);
  // const [expenseCategories, setExpenseCategories] = useState([]); // This is for the AI prompt
  // const [incomeCategories, setIncomeCategories] = useState([]); // This is for the AI prompt
  const [transactionsInDatabase, setTransactionsInDatabase] = useState([]);
  const [refreshTransactions, setRefreshTransactions] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDefineCategory, setShowDefineCategory] = useState(false);
  const [bankStatement, setBankStatement] = useState({ accountId: null, data: [] });
  const [assets, setAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const [total, setTotal] = useState(0);


  // Getting all transactions from the database
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data: transactions, error: errorTransactions } = await supabase_client
        .from("transactions")
        .select("*, categories(category)")
        .eq("user_id", userId);
      if (errorTransactions) {
        console.log(errorTransactions);
      } else {
        transactions.forEach(transaction => {
          transaction.category = transaction.categories.category;
          delete transaction.categories;
        });
        setTransactionsInDatabase(transactions);
      }
    };
    fetchTransactions();
    setRefreshTransactions(false);
  }, [refreshTransactions]);

  // Getting all accounts from the database
  useEffect(() => {
    const fetchAccounts = async () => {
      const { data: accounts, error: errorAccounts } = await supabase_client
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .eq("user_id", userId);
      if (errorAccounts) {
        console.log(errorAccounts);
      } else {
        const accountsData = accounts.map(account => {
          const accountTransactions = transactionsInDatabase.filter(transaction => transaction.account_id === account.id);
          const expenseBalances = accountTransactions.filter(transaction => transaction.category === "expense").reduce((sum, transaction) => sum + transaction.amount, 0);
          const transferOutBalances = accountTransactions.filter(transaction => transaction.category === "transferOut").reduce((sum, transaction) => sum + transaction.amount, 0);
          const incomeBalances = accountTransactions.filter(transaction => transaction.category === "income").reduce((sum, transaction) => sum + transaction.amount, 0); 
          const transferInBalances = accountTransactions.filter(transaction => transaction.category === "transferIn").reduce((sum, transaction) => sum + transaction.amount, 0);
          const accountBalance = Math.round(((incomeBalances + transferInBalances) - (expenseBalances + transferOutBalances))*100)/100;
          return {
            ...account,
            balance: accountBalance
          }
        });
        setAccounts(accountsData);
      }
    };
    fetchAccounts();
  }, [transactionsInDatabase]); // This is to make sure that the accounts balances are updated when the transactions are updated

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

  // Getting accounts separated by type and their balances (typeCash, typeDebit, typeCredit, typeSavings) 
  useEffect(() => {
    const getAccountsByTypeAndBalances = () => {
      const typeCashAccounts = accounts.filter((account) => account.type === "cash");
      const typeCashBalance = totalBalanceByAccountType(typeCashAccounts);
      setTypeCash([typeCashAccounts, typeCashBalance]);
      const typeDebitAccounts = accounts.filter((account) => account.type === "debit");
      const typeDebitBalance = totalBalanceByAccountType(typeDebitAccounts);
      setTypeDebit([typeDebitAccounts, typeDebitBalance]);
      const typeCreditAccounts = accounts.filter((account) => account.type === "credit");
      const typeCreditBalance = totalBalanceByAccountType(typeCreditAccounts);
      setTypeCredit([typeCreditAccounts, typeCreditBalance]);
      const typeSavingsAccounts = accounts.filter((account) => account.type === "savings");
      const typeSavingsBalance = totalBalanceByAccountType(typeSavingsAccounts);
      setTypeSavings([typeSavingsAccounts, typeSavingsBalance]);
    };
    getAccountsByTypeAndBalances();
  }, [accounts]);

  // Getting assets, liabilities, and total
  useEffect(() => {
    const getAssetsLiabilitiesAndTotal = () => {
      const totalBalances = [typeCash[1], typeDebit[1], typeCredit[1], typeSavings[1]];
      const assets = totalBalances.filter(balance => balance > 0).reduce((sum, balance) => sum + balance, 0);
      const liabilities = totalBalances.filter(balance => balance < 0).reduce((sum, balance) => sum + balance, 0);
      const total = assets - Math.abs(liabilities);
      setAssets(assets);
      setLiabilities(liabilities);  
      setTotal(total);
    };
    getAssetsLiabilitiesAndTotal();
  }, [typeCash, typeDebit, typeCredit, typeSavings]);

  // Making sure that the bankStatement is not empty before showing the DefineCategory component
  useEffect(() => {
    if (bankStatement.data.length > 0) {
      setShowDefineCategory(true);
    }
  }, [bankStatement]);

  // useCallback is used to prevent the function from being recreated on every render. Especially when the function is passed as a prop to a child component.
  const processCSV = useCallback((accountId, accountType, file, categoriesInDatabase, transactionsInDatabase) => {
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
  

  const defineCategory = async (accountId, date, description, amount, categoriesInDatabase, transactionsInDatabase) => {

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
    if (transfer.length > 0 && amount > 0) {
      return "transferIn";
    } else if (transfer.length > 0 && amount < 0) {
      return "transferOut";
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
        const randomCategory = categoriesInDatabase[Math.floor(Math.random() * categoriesInDatabase.length)].category;
        return randomCategory; // This is a temporary solution to avoid using the AI
      }
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
          transaction["Debit"] === "" ? transaction["Credit"] : -transaction["Debit"],
          categoriesInDatabase,
          transactionsInDatabase
        ),
      }))
    );
    return formattedBankStatement;
  };

  const formatingCapitalOneDebit= async (accountId, bankStatement, categoriesInDatabase, transactionsInDatabase) => {
    // Capital One Debit Card bankStatement format:
    // Account Number: "1234"
    // Balance: "65.79"
    // Transaction Amount: "50"
    // Transaction Date: "07/06/25"
    // Transaction Description: "Debit Card Purchase - SUNTRUST BANK ATLANTA GA"
    // Transaction Type: "Debit"

    console.log("formatingCapitalOneDebit+++++++++++++++++++++++++++++++++");
    // Format the date to YYYY-MM-DD
    bankStatement.forEach(transaction => {
      transaction["Transaction Date"] = formatDate_YYYY_MM_DD(transaction["Transaction Date"]);
    });
    // Format the bankStatement and get the category for each transaction
    const formattedBankStatement = await Promise.all(
      bankStatement.map(async transaction => ({
        Date: transaction["Transaction Date"],
        Description: transaction["Transaction Description"],
        Amount: transaction.transactionType === "Debit" ? -transaction["Transaction Amount"] : transaction["Transaction Amount"],
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

  const totalBalanceByAccountType = (accountType) => {
    if (accountType.length > 0) {
      return accountType.reduce((sum, account) => sum + account.balance, 0);
    }
    return 0;
  };
  
  const renderingAccountsByType = () => {
    
    if (categoriesInDatabase.length === 0) {
      return (
        <div className="w-full h-full flex justify-center items-center text-white">
          Loading ...
        </div>
      );
    }
    const accountsByType = [typeCash, typeCredit, typeDebit, typeSavings];
    if (accountsByType.every(accountType => accountType[0].length === 0)) {
      return (
        <div className="w-full h-full flex justify-center items-center text-white">
          No accounts found
        </div>
      );
    } else {
        return accountsByType.map(accountType => {
          if (accountType[0].length > 0) {
            return <AccountsByType
                      key={accountType[0][0].type}
                      type={accountType[0][0].type}
                      totalbalance={accountType[1]}
                      accounts={accountType[0]}
                      deleteAccount={deleteAccount}
                      processCSV={processCSV}
                      categoriesInDatabase={categoriesInDatabase}
                      transactionsInDatabase={transactionsInDatabase}
                    />
          } else {
            return null;
          }
        });
      }
  }

  const addAccount = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const updatingAccounts = useCallback((newAccount) => {
    const newAccountWithBalance = {
      ...newAccount,
      balance: 0 // Set initial balance to 0 when account is created
    };
    setAccounts((prevAccounts) => [...prevAccounts, newAccountWithBalance]);
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
        {renderingAccountsByType()}
      </div>
    </div>
  );
};
export default Accounts;
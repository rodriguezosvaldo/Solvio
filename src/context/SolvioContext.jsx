import React, { createContext, useState, useEffect } from "react";
import supabase_client from "../supabase/client";
import Login from "../components/Login";

const SolvioContext = createContext();

const SolvioProvider = ({ children }) => {
    const [assetsLastMonthInDatabase, setAssetsLastMonthInDatabase] = useState(0);
    const [liabilitiesLastMonthInDatabase, setLiabilitiesLastMonthInDatabase] = useState(0);
    const [totalLastMonthInDatabase, setTotalLastMonthInDatabase] = useState(0);
    const [assetsPreviousMonth, setAssetsPreviousMonth] = useState(0);
    const [liabilitiesPreviousMonth, setLiabilitiesPreviousMonth] = useState(0);
    const [totalPreviousMonth, setTotalPreviousMonth] = useState(0);
    const [transactionsInDatabase, setTransactionsInDatabase] = useState([]);
    const [categoriesInDatabase, setCategoriesInDatabase] = useState([]);
    const [refreshTransactions, setRefreshTransactions] = useState(true);
    const [allTotalBalancesByAccountLastMonthInDatabase, setAllTotalBalancesByAccountLastMonthInDatabase] = useState([]); // List of all accounts with their id, type and total balance from all transactions until the last month registered in the database
    const [allTotalBalancesByAccountPreviousMonth, setAllTotalBalancesByAccountPreviousMonth] = useState([]); // List of all accounts with their id, type and total balance from all transactions until the previous month registered in the database
    const [refreshAccounts, setRefreshAccounts] = useState(true);
    const [userId, setUserId] = useState(null);
    const [refreshUserId, setRefreshUserId] = useState(true);
    const [loading, setLoading] = useState(true);

    // Getting the user from the database
    useEffect(() => {
        const checkUser = async () => {
        try {
            const { data, error } = await supabase_client.auth.getUser();
            if (error) {
            console.log('No user ++++++++++++++');
            console.log(error);
            setUserId(null);
            return;
            }
            setUserId(data.user.id);
        } catch (error) {
            setUserId(null);
            console.log(error);
        } finally {
            setLoading(false);
        }
        };
        checkUser();
        setRefreshUserId(false);
    }, [refreshUserId]); 

    // Getting all categories from the database
    useEffect(() => {
        if (!userId) {
            return;
        }
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
                arrayCategoriesInDatabase.push({category_id: categoryAndType.id, category: categoryAndType.category, categoryType: categoryAndType.type});
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
    }, [userId]);

    // Getting all transactions from the database
    useEffect(() => {
        if (!userId) {
            return;
        }
        const fetchTransactions = async () => {
            const { data: transactions, error: errorTransactions } = await supabase_client
                .from("transactions")
                .select("*, categories(category, type)")
                .eq("user_id", userId);
            if (errorTransactions) {
                console.log(errorTransactions);
            } else {
                transactions.forEach(transaction => {
                transaction.category = transaction.categories.category;
                transaction.type = transaction.categories.type;
                delete transaction.categories;
                });
                setTransactionsInDatabase(transactions);
            }
        };
        fetchTransactions();
        setRefreshTransactions(false);
    }, [refreshTransactions, userId]);

    // Getting all accounts with their id, type and total balance
    useEffect(() => {
        if (!userId) {
            return;
        }
        const fetchAccountIds = async () => {
            const { data, error } = await supabase_client
                .from("transactions")
                .select("account_id, accounts(name, type)")
                .eq("user_id", userId);
            if (error) {
                console.log(error);
            } else {
                data.forEach(account => {
                    account.name = account.accounts.name;
                    account.type = account.accounts.type;
                    delete account.accounts;
                });
                const accountIds = data.map(account => account.account_id);
                const accountTypes = data.map(account => account.type);
                const accountNames = data.map(account => account.name);
                const setAccountIds = [...new Set(accountIds)]; // Remove duplicates (before was like: [1, 1, 2, 3, 3, 4, 4, 4, 5] now is like: [1, 2, 3, 4, 5])
                const setAccountTypes = [...new Set(accountTypes)];
                const setAccountNames = [...new Set(accountNames)];
                const accountIdsAndTypes = [];
                for (let i = 0; i < setAccountIds.length; i++) {
                    accountIdsAndTypes.push({account_id: setAccountIds[i], accountType: setAccountTypes[i], accountName: setAccountNames[i]});
                }
                // Get all balances excluding transferOut and transferIn because they are not assets or liabilities,
                // only money moved between accounts
                const allTransactionsNotTransfer = transactionsInDatabase.filter(transaction => {
                    return transaction.category !== "transferOut" && transaction.category !== "transferIn";
                });  
                const transactionsInDatabaseDates = allTransactionsNotTransfer.map(transaction => transaction.date);
                const lastDateInDatabase = transactionsInDatabaseDates.sort((a, b)=> new Date(a) - new Date(b))[transactionsInDatabaseDates.length - 1]; // Get the last date in the database
                const lastDateInDatabaseObj = new Date(lastDateInDatabase); // Convert string to Date object to be able to use the getFullYear, getMonth and getDate methods to calculate the previous month
                const previousMonthDateObj = new Date(lastDateInDatabaseObj.getFullYear(), lastDateInDatabaseObj.getMonth() - 1, lastDateInDatabaseObj.getDate()); // Get the date of the previous month
                const previousMonthDate = previousMonthDateObj.toISOString().split('T')[0]; // Convert Date object to string in the format YYYY-MM-DD

                const allTotalBalancesByAccountLastMonthInDatabase = accountIdsAndTypes.map(account=> {
                    const incomeBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.account_id && transaction.type === "income" && transaction.date <= lastDateInDatabase).reduce((sum, transaction) => sum + transaction.amount, 0);
                    const expenseBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.account_id && transaction.type === "expense" && transaction.date <= lastDateInDatabase).reduce((sum, transaction) => sum + transaction.amount, 0);
                    const totalBalanceByAccount = Math.round((incomeBalance - expenseBalance)*100)/100;
                    return {accountId: account.account_id, accountType: account.accountType, accountName: account.accountName, totalBalance: totalBalanceByAccount};
                });
                const allTotalBalancesByAccountPreviousMonth = accountIdsAndTypes.map(account=> {
                    const incomeBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.account_id && transaction.type === "income" && transaction.date <= previousMonthDate).reduce((sum, transaction) => sum + transaction.amount, 0);
                    const expenseBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.account_id && transaction.type === "expense" && transaction.date <= previousMonthDate).reduce((sum, transaction) => sum + transaction.amount, 0);
                    const totalBalanceByAccount = Math.round((incomeBalance - expenseBalance)*100)/100;
                    return {accountId: account.account_id, accountType: account.accountType, accountName: account.accountName, totalBalance: totalBalanceByAccount};
                });
                setAllTotalBalancesByAccountLastMonthInDatabase(allTotalBalancesByAccountLastMonthInDatabase);
                setAllTotalBalancesByAccountPreviousMonth(allTotalBalancesByAccountPreviousMonth);
                setRefreshAccounts(false);
            }
        }
        fetchAccountIds();
    }, [transactionsInDatabase, refreshAccounts]);

    // Getting assets, liabilities, and total
    useEffect(() => {
        if (!userId) {
            return;
        }
        const getAssetsLiabilitiesAndTotal = () => {
            if (transactionsInDatabase.length === 0) {
                setAssets(0);
                setLiabilities(0);
                setTotal(0);
                return;
            }

            // Get assets, liabilities and total of the last month in the database
            const positiveBalancesLastMonth = allTotalBalancesByAccountLastMonthInDatabase.filter(account => account.totalBalance >= 0);
            const negativeBalancesLastMonth = allTotalBalancesByAccountLastMonthInDatabase.filter(account => account.totalBalance < 0);
            const assetsLastMonth = Math.round(positiveBalancesLastMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const liabilitiesLastMonth = Math.round(negativeBalancesLastMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const absoluteLiabilitiesLastMonth = Math.abs(liabilitiesLastMonth);
            const totalLastMonth = assetsLastMonth - absoluteLiabilitiesLastMonth;
            setAssetsLastMonthInDatabase(assetsLastMonth);
            setLiabilitiesLastMonthInDatabase(liabilitiesLastMonth);  
            setTotalLastMonthInDatabase(totalLastMonth);

            // Get assets, liabilities and total of the previous month in the database
            const positiveBalancesPreviousMonth = allTotalBalancesByAccountPreviousMonth.filter(account => account.totalBalance >= 0);
            const negativeBalancesPreviousMonth = allTotalBalancesByAccountPreviousMonth.filter(account => account.totalBalance < 0);
            const assetsPreviousMonth = Math.round(positiveBalancesPreviousMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const liabilitiesPreviousMonth = Math.round(negativeBalancesPreviousMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const absoluteLiabilitiesPreviousMonth = Math.abs(liabilitiesPreviousMonth);
            const totalPreviousMonth = assetsPreviousMonth - absoluteLiabilitiesPreviousMonth;
            setAssetsPreviousMonth(assetsPreviousMonth);
            setLiabilitiesPreviousMonth(liabilitiesPreviousMonth);
            setTotalPreviousMonth(totalPreviousMonth);
        };
        getAssetsLiabilitiesAndTotal();
    }, [allTotalBalancesByAccountLastMonthInDatabase]);

    return (
        loading ? <div>Cargando...</div> : !userId ? <Login /> :
        <SolvioContext.Provider value={{
        assetsLastMonthInDatabase,
        liabilitiesLastMonthInDatabase,
        totalLastMonthInDatabase,
        assetsPreviousMonth,
        liabilitiesPreviousMonth,
        totalPreviousMonth,
        transactionsInDatabase, setTransactionsInDatabase,
        categoriesInDatabase, setCategoriesInDatabase,
        allTotalBalancesByAccountLastMonthInDatabase, setRefreshAccounts,
        setRefreshTransactions,
        userId,
        setRefreshUserId
        }}>
        {children}
        </SolvioContext.Provider>
    );
};

export { SolvioContext, SolvioProvider }

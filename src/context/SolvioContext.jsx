import React, { createContext, useState, useEffect } from "react";
import supabase_client from "../supabase/client";
import Login from "../components/Login";

const SolvioContext = createContext();

const SolvioProvider = ({ children }) => {
    const [assets, setAssets] = useState(0);
    const [liabilities, setLiabilities] = useState(0);
    const [total, setTotal] = useState(0);
    const [transactionsInDatabase, setTransactionsInDatabase] = useState([]);
    const [categoriesInDatabase, setCategoriesInDatabase] = useState([]);
    const [refreshTransactions, setRefreshTransactions] = useState(true);
    const [allTotalBalancesByAccount, setAllTotalBalancesByAccount] = useState([]); // List of all accounts with their id, type and total balance
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
                const allTotalBalancesByAccount = accountIdsAndTypes.map(account=> {
                    const incomeBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.account_id && transaction.type === "income").reduce((sum, transaction) => sum + transaction.amount, 0);
                    const expenseBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.account_id && transaction.type === "expense").reduce((sum, transaction) => sum + transaction.amount, 0);
                    const totalBalanceByAccount = Math.round((incomeBalance - expenseBalance)*100)/100;
                    return {accountId: account.account_id, accountType: account.accountType, accountName: account.accountName, totalBalance: totalBalanceByAccount};
                });
                setAllTotalBalancesByAccount(allTotalBalancesByAccount);
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
                      
            // Get assets, liabilities and total
            const positiveBalances = allTotalBalancesByAccount.filter(account => account.totalBalance >= 0);
            const negativeBalances = allTotalBalancesByAccount.filter(account => account.totalBalance < 0);
            const assets = Math.round(positiveBalances.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const liabilities = Math.round(negativeBalances.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const absoluteLiabilities = Math.abs(liabilities);
            const total = assets - absoluteLiabilities;
            setAssets(assets);
            setLiabilities(liabilities);  
            setTotal(total);
        };
        getAssetsLiabilitiesAndTotal();
    }, [allTotalBalancesByAccount]);

    return (
        loading ? <div>Cargando...</div> : !userId ? <Login /> :
        <SolvioContext.Provider value={{
        assets,
        liabilities,
        total,
        transactionsInDatabase, setTransactionsInDatabase,
        categoriesInDatabase, setCategoriesInDatabase,
        allTotalBalancesByAccount, setRefreshAccounts,
        setRefreshTransactions,
        userId,
        setRefreshUserId
        }}>
        {children}
        </SolvioContext.Provider>
    );
};

export { SolvioContext, SolvioProvider }

import React, { createContext, useState, useEffect } from "react";
import supabase_client from "../supabase/client";
import Login from "../components/Login";

const SolvioContext = createContext();

const SolvioProvider = ({ children }) => {
    const [assetsLastMonthInDatabase, setAssetsLastMonthInDatabase] = useState(0); // Used in [GeneralBudget, MainCategories]
    const [liabilitiesLastMonthInDatabase, setLiabilitiesLastMonthInDatabase] = useState(0); // [GeneralBudget, MainCategories]
    const [totalLastMonthInDatabase, setTotalLastMonthInDatabase] = useState(0); // [GeneralBudget, MainCategories]
    const [assetsPreviousMonth, setAssetsPreviousMonth] = useState(0); // [MainCategories]
    const [liabilitiesPreviousMonth, setLiabilitiesPreviousMonth] = useState(0); // [MainCategories]
    const [totalPreviousMonth, setTotalPreviousMonth] = useState(0); // [MainCategories]

    const [transactionsInDatabase, setTransactionsInDatabase] = useState([]); // []
    const [refreshTransactions, setRefreshTransactions] = useState(true); // []
    const [categoriesInDatabase, setCategoriesInDatabase] = useState([]); // []
    
    const [allTransactionsNotTransfer, setAllTransactionsNotTransfer] = useState([]); // []
    const [lastDateInDatabase, setLastDateInDatabase] = useState(null); // [useEffect (Getting all accounts with their id, type and total balance)]
    const [previousMonthDate, setPreviousMonthDate] = useState(null); // [useEffect (Getting all accounts with their id, type and total balance)]
    const [balanceByCatLastAndPreviousDate, setBalanceByCatLastAndPreviousDate] = useState([]); // [MainCategories, PieChart]
    const [totalExpenseAndIncomeByMonth, setTotalExpenseAndIncomeByMonth] = useState([]); // [IncomeExpenseChart.jsx]
    
    const [balanceByAccountLastMonthInDatabase, setBalanceByAccountLastMonthInDatabase] = useState([]); // []. List of all accounts with their id, type and total balance from all transactions until the last month registered in the database
    const [balanceByAccountPreviousMonth, setBalanceByAccountPreviousMonth] = useState([]); // []. List of all accounts with their id, type and total balance from all transactions until the previous month registered in the database, useful to get assets,liabilities, and total, and compare with last month for the trend arrow
    const [refreshAccounts, setRefreshAccounts] = useState(true); // [, ]
    
    const [userId, setUserId] = useState(null); // [, ]
    const [refreshUserId, setRefreshUserId] = useState(true); // [, ]
    const [loading, setLoading] = useState(true); // [, ]

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

    // Getting the last date in DB and previous month, also getting balance of each category on those dates
    useEffect(() => {
        if (transactionsInDatabase.length > 0 && categoriesInDatabase.length > 0) {
            // Get all transactions excluding transferOut and transferIn because they are not assets or liabilities, only money moved between accounts
            const allTransactionsNotTransfer = transactionsInDatabase.filter(transaction => {
                return transaction.category !== "transferOut" && transaction.category !== "transferIn";
            });  

            // Get the last date in the database and the previous month date
            const transactionsInDatabaseDates = allTransactionsNotTransfer.map(transaction => transaction.date);
            const lastDateInDatabase = transactionsInDatabaseDates.sort((a, b)=> new Date(a) - new Date(b))[transactionsInDatabaseDates.length - 1]; // Get the last date in the database
            const lastDateInDatabaseObj = new Date(lastDateInDatabase); // Convert string to Date object to be able to use the getFullYear, getMonth and getDate methods to calculate the previous month
            const previousMonthDateObj = new Date(lastDateInDatabaseObj.getFullYear(), lastDateInDatabaseObj.getMonth() - 1, lastDateInDatabaseObj.getDate()); // Get the date of the previous month
            const previousMonthDate = previousMonthDateObj.toISOString().split('T')[0]; // Convert Date object to string in the format YYYY-MM-DD

            // Getting the balance of each category in the last date and the previous month registered in the database. Useful to compare both balances and show the trend arrow
            const categoriesNotTransfer = categoriesInDatabase.filter(category => category.category !== "transferOut" && category.category !== "transferIn");
            
            // Get first day of last month in database and first day of previous month
            const firstDayLastMonth = new Date(lastDateInDatabaseObj.getFullYear(), lastDateInDatabaseObj.getMonth(), 1).toISOString().split('T')[0];
            const firstDayPreviousMonth = new Date(previousMonthDateObj.getFullYear(), previousMonthDateObj.getMonth(), 1).toISOString().split('T')[0];
            
            const balancesByCategory = categoriesNotTransfer.map(category => {
                let lastMonthInDatabaseBalance = 0;
                let previousMonthBalance = 0;

                lastMonthInDatabaseBalance = Math.round(allTransactionsNotTransfer
                    .filter(transaction => 
                    transaction.category_id === category.category_id &&  
                    transaction.date >= firstDayLastMonth && 
                    transaction.date <= lastDateInDatabase)
                    .reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;

                previousMonthBalance = Math.round(allTransactionsNotTransfer
                    .filter(transaction => 
                    transaction.category_id === category.category_id && 
                    transaction.date >= firstDayPreviousMonth && 
                    transaction.date <= previousMonthDate)
                    .reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;
                
                const difference = Math.round((lastMonthInDatabaseBalance - previousMonthBalance)*100)/100;
                return {
                    categoryId: category.category_id,
                    categoryName: category.category,
                    categoryType: category.categoryType,
                    lastMonthBalance: lastMonthInDatabaseBalance,
                    previousMonthBalance: previousMonthBalance,
                    difference: difference
                }  
            })
            const colors = ["red", "blue", "purple", "orange", "green", "yellow", "pink", "brown", "gray", "cyan", "lime"];
            // Separate expense categories to be able to sort only them in descending order
            const onlyExpense = balancesByCategory.filter(cat => cat.categoryType === "expense").sort((cat1, cat2) => Math.abs(cat2.lastMonthBalance) - Math.abs(cat1.lastMonthBalance));
            const onlyIncome = balancesByCategory.filter(cat => cat.categoryType === "income");
            const allCategories = [...onlyExpense, ...onlyIncome];
            // Add color to each category
            const balanceByCatLastAndPreviousDate = allCategories.map((category, index) => ({
                ...category,
                fill: colors[index]
            }));
            setBalanceByCatLastAndPreviousDate(balanceByCatLastAndPreviousDate);
            setLastDateInDatabase(lastDateInDatabase);
            setPreviousMonthDate(previousMonthDate); // used in useEffect (Getting all accounts with their id, type and total balance)
            setAllTransactionsNotTransfer(allTransactionsNotTransfer); // used in useEffect (Getting all accounts with their id, type and total balance)
        }
    }, [transactionsInDatabase]);   

    // Getting total expense and income by month
    useEffect(() => {
        if (lastDateInDatabase && allTransactionsNotTransfer.length > 0) {
            const allExpenseTransactions = allTransactionsNotTransfer.filter(transaction => transaction.type === "expense");
            const allIncomeTransactions = allTransactionsNotTransfer.filter(transaction => transaction.type === "income");
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthsNumbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
            const lastMonth = lastDateInDatabase.split("-")[1];
            const monthsToCompare = monthsNumbers.slice(0, lastMonth);

            const totalExpenseAndIncomeByMonth = monthsToCompare.map((monthNumber, index) => {
                const expenseTransactionsByMonth = allExpenseTransactions.filter(transaction => transaction.date.split("-")[1] === monthNumber);
                const totalExpense = Math.round(expenseTransactionsByMonth.reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;

                const incomeTransactionsByMonth = allIncomeTransactions.filter(transaction => transaction.date.split("-")[1] === monthNumber);
                const totalIncome = Math.round(incomeTransactionsByMonth.reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;

                return { 
                    month: months[index], 
                    expense: totalExpense, 
                    income: totalIncome };
            });
            setTotalExpenseAndIncomeByMonth(totalExpenseAndIncomeByMonth);
        }
    }, [allTransactionsNotTransfer, lastDateInDatabase]);
    
    // Getting all accounts with their id, type and total balance
    useEffect(() => {
        if (!userId) {
            return;
        }
        const fetchAccountIds = async () => {
            const { data, error } = await supabase_client
                .from("accounts")
                .select("id, name, type")
                .eq("is_active", true)
                .eq("user_id", userId);
            if (error) {
                console.log(error);
            } else {
                const accountIdsAndTypes = data.map(account => ({accountId: account.id, accountType: account.type, accountName: account.name}));
                console.log("accountIdsAndTypes", accountIdsAndTypes);
                if (allTransactionsNotTransfer.length > 0) {
                    const balanceByAccountLastMonthInDatabase = accountIdsAndTypes.map(account=> {
                        const incomeBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.accountId && transaction.type === "income" && transaction.date <= lastDateInDatabase).reduce((sum, transaction) => sum + transaction.amount, 0);
                        const expenseBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.accountId && transaction.type === "expense" && transaction.date <= lastDateInDatabase).reduce((sum, transaction) => sum + transaction.amount, 0);
                        const totalBalanceByAccount = Math.round((incomeBalance - expenseBalance)*100)/100;
                        return {accountId: account.accountId, 
                            accountType: account.accountType, 
                            accountName: account.accountName, 
                            totalBalance: totalBalanceByAccount};
                    });
                    const balanceByAccountPreviousMonth = accountIdsAndTypes.map(account=> {
                        const incomeBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.accountId && transaction.type === "income" && transaction.date <= previousMonthDate).reduce((sum, transaction) => sum + transaction.amount, 0);
                        const expenseBalance = allTransactionsNotTransfer.filter(transaction => transaction.account_id === account.accountId && transaction.type === "expense" && transaction.date <= previousMonthDate).reduce((sum, transaction) => sum + transaction.amount, 0);
                        const totalBalanceByAccount = Math.round((incomeBalance - expenseBalance)*100)/100;
                        return {accountId: account.accountId, 
                            accountType: account.accountType, 
                            accountName: account.accountName, 
                            totalBalance: totalBalanceByAccount};
                    });
                    setBalanceByAccountLastMonthInDatabase(balanceByAccountLastMonthInDatabase);
                    setBalanceByAccountPreviousMonth(balanceByAccountPreviousMonth);
                    setRefreshAccounts(false);
                }
            }
        }
        fetchAccountIds();
    }, [allTransactionsNotTransfer, refreshAccounts]);

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
            const positiveBalancesLastMonth = balanceByAccountLastMonthInDatabase.filter(account => account.totalBalance >= 0);
            const negativeBalancesLastMonth = balanceByAccountLastMonthInDatabase.filter(account => account.totalBalance < 0);
            const assetsLastMonth = Math.round(positiveBalancesLastMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const liabilitiesLastMonth = Math.round(negativeBalancesLastMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const absoluteLiabilitiesLastMonth = Math.abs(liabilitiesLastMonth);
            const totalLastMonth = assetsLastMonth - absoluteLiabilitiesLastMonth;
            setAssetsLastMonthInDatabase(assetsLastMonth);
            setLiabilitiesLastMonthInDatabase(liabilitiesLastMonth);  
            setTotalLastMonthInDatabase(totalLastMonth);

            // Get assets, liabilities and total of the previous month in the database
            const positiveBalancesPreviousMonth = balanceByAccountPreviousMonth.filter(account => account.totalBalance >= 0);
            const negativeBalancesPreviousMonth = balanceByAccountPreviousMonth.filter(account => account.totalBalance < 0);
            const assetsPreviousMonth = Math.round(positiveBalancesPreviousMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const liabilitiesPreviousMonth = Math.round(negativeBalancesPreviousMonth.reduce((sum, account) => sum + account.totalBalance, 0)*100)/100;
            const absoluteLiabilitiesPreviousMonth = Math.abs(liabilitiesPreviousMonth);
            const totalPreviousMonth = assetsPreviousMonth - absoluteLiabilitiesPreviousMonth;
            setAssetsPreviousMonth(assetsPreviousMonth);
            setLiabilitiesPreviousMonth(liabilitiesPreviousMonth);
            setTotalPreviousMonth(totalPreviousMonth);
        };
        getAssetsLiabilitiesAndTotal();
    }, [balanceByAccountLastMonthInDatabase]);

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
        balanceByAccountLastMonthInDatabase, setRefreshAccounts,
        balanceByCatLastAndPreviousDate,
        allTransactionsNotTransfer, // [IncomeExpenseChart.jsx]
        lastDateInDatabase, // [IncomeExpenseChart.jsx]
        totalExpenseAndIncomeByMonth, // [IncomeExpenseChart.jsx]
        setRefreshTransactions,
        userId,
        setRefreshUserId
        }}>
        {children}
        </SolvioContext.Provider>
    );
};

export { SolvioContext, SolvioProvider }

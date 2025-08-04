import React, { useState, useEffect } from 'react'
import supabase_client from '../../supabase/client';


const DefineCategory = ({userId, accountId, bankStatement, categoriesInDatabase, transactionsInDatabase, leaveDefineCategory}) => {

    // Make the keys of the bankStatement object lowercase
    const bankStatementLowerCase = bankStatement.map(transaction => {
        const newTransaction = {};
        Object.keys(transaction).forEach(key => {
            newTransaction[key.toLowerCase()] = transaction[key];
        });
        return newTransaction;
    });

    // Initialize the categoryValues state with the categories in bankStatement
    const initializeCategoryValues = () => {
        const initialCategories = {};
        bankStatementLowerCase.forEach((transaction, index) => {
            if (transaction.category) {
                const catInDatabase = categoriesInDatabase.find(cat => cat.category === transaction.category); // Find the category in the database that matches the category in the bank statement. Ex: catInDatabase = {id: 1, category: "Food"}
                if (catInDatabase) {
                    initialCategories[index] = {category_id: catInDatabase.category_id, category: catInDatabase.category};
                } else {
                    initialCategories[index] = {category_id: index, category: transaction.category};
                }
            }
        });
        return initialCategories;
    }

    const [categoryValues, setCategoryValues] = useState(initializeCategoryValues);
    console.log(categoryValues);

    useEffect(() => {
        initializeCategoryValues();
    }, []);
    

    const storeCategory = (e, index) => {
        const selectedCategoryId = e.target.value;
        const selectedCategory = categoriesInDatabase.find(cat => cat.category_id == selectedCategoryId);
        
        setCategoryValues(prev => ({
            ...prev,
            [index]: {
                category_id: selectedCategoryId,
                category: selectedCategory ? selectedCategory.category : ''
            }
        }));
    }

    const insertData = async (transactionsReadyToSave) => {
        const { data, error } = await supabase_client
        .from("transactions")
        .insert(transactionsReadyToSave)
        .select(); // This returns all the data of the transactions inserted, including auto-generated fields like id, created_at, etc.
        if (error) {
            console.error("Error inserting transactions:", error); // Debugging++++++++++++++++
        } else {
            console.log("Transactions inserted successfully:", data); // Debugging++++++++++++++++
        }
    }

    const saveAllTransactions = () => {
        // Avoid inserting duplicate transactions
        let bankStatementToSave;
            // Check if transactionsInDatabase is an array and has at least one element
        if (Array.isArray(transactionsInDatabase) && transactionsInDatabase.length > 0) {
            bankStatementToSave = bankStatementLowerCase.filter((transaction) => {
                // .some() returns true if at least one element in transactionsInDatabase satisfies the conditions
                // meaning that transaction is already in the database, in that case the sign ! is used to return false
                // so the transaction is not added to bankStatementToSave
                return !transactionsInDatabase.some((transactionInDatabase) => {
                    return (
                        transactionInDatabase.user_id === userId &&
                        transactionInDatabase.account_id === accountId &&
                        transactionInDatabase.date === transaction.date &&
                        Number(transactionInDatabase.amount) === Math.abs(Number(transaction.amount)) &&
                        transactionInDatabase.description === transaction.description
                    );
                });
            });
        } else {
            bankStatementToSave = bankStatementLowerCase;
        }
        const transactionsReadyToSave = bankStatementToSave.map((transaction, index) => ({
            user_id: userId,
            account_id: accountId,
            date: transaction.date,
            amount: Math.abs(Number(transaction.amount)),
            category_id: categoryValues[index].category_id,
            description: transaction.description,
        }));
        insertData(transactionsReadyToSave);
        leaveDefineCategory();
    }

    return (
        <div className='bg-blue-950 sm:text-base max-[375px]:text-[8px] flex flex-col w-full h-full text-xs justify-between items-center gap-8 p-4 overflow-y-auto rounded-3xl border border-white/60 animate-blurred-fade-in duration-300'>
            <table className='w-full h-full justify-center items-center text-white text-center gap-4 p-4 overflow-y-auto'>
                <thead>
                    <tr className='border-b-1 border-white'>
                        <th colSpan={3}>Bank Statement</th>
                        <th>|</th>
                        <th colSpan={1}>Personalized<br/>Categories</th>
                    </tr>
                    <tr>
                        {bankStatementLowerCase[0].date ? <th className='w-1/3'>Date</th> : ''}
                        {bankStatementLowerCase[0].description ? <th className='w-1/3'>Description</th> : ''}
                        {bankStatementLowerCase[0].amount ? <th className='w-1/3'>Amount</th> : ''}
                        <th>|</th> 
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {/* index is needed to avoid the React warning: Each child in a list should have a unique "key" prop. */}
                    {bankStatementLowerCase.map((transaction, index) => (
                        
                        <tr 
                        key={index}
                        className='border-b-1 border-green-500'
                        >
                            {transaction.date ? <td className='p-2'>{transaction.date}</td> : ''} 
                            {transaction.description ? <td className='p-2'>{transaction.description}</td> : ''}   
                            {transaction.amount ? <td className='p-2'>{transaction.amount}</td> : ''}
                            <td>|</td>
                            <td className='p-2'>
                                <select
                                className='bg-white text-black disabled:bg-black'
                                value={categoryValues[index] && categoryValues[index].category_id ? categoryValues[index].category_id : ''}
                                required
                                onChange={(e) => storeCategory(e, index)}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categoriesInDatabase.map((category) => (
                                        <option key={category.category_id} value={category.category_id}>{category.category}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button 
            className='bg-green-700 text-white sm:w-80 w-1/2 px-4 py-2 rounded-md hover:scale-105 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed '
            onClick={saveAllTransactions}
            disabled={Object.keys(categoryValues).length !== bankStatementLowerCase.length}
            >Save All</button>
        </div>
    )
}

export default DefineCategory;
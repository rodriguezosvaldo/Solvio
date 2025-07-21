import React, { useState, useEffect } from 'react'
import supabase_client from '../../supabase/client';


const DefineCategory = ({userId, accountId, bankStatement, categoriesInDatabase, leaveDefineCategory}) => {

    const [categoryValues, setCategoryValues] = useState({});

    // Make the keys of the bankStatement object lowercase
    const bankStatementLowerCase = bankStatement.map(transaction => {
        // Get only categories to show in the select options
        Object.keys(transaction).forEach(key => {
            transaction[key.toLowerCase()] = transaction[key];
        });
        return transaction;
    });

    // Initialize the categoryValues state with the categories in bankStatement
    useEffect(() => {
        const initialCategories = {};
        bankStatementLowerCase.forEach((transaction, index) => {
            if (transaction.category) {
                const catInDatabase = categoriesInDatabase.find(cat => cat.category === transaction.category); // Find the category in the database that matches the category in the bank statement. Ex: catInDatabase = {id: 1, category: "Food"}
                if (catInDatabase) {
                    initialCategories[index] = catInDatabase.id;
                }
            }
        });
        console.log("initialCategories++++++++++", initialCategories);
        setCategoryValues(initialCategories);
    }, []);

    const storeCategory = (e, index) => {
        setCategoryValues(prev => ({
            ...prev,
            [index]: e.target.value
        }));
    }

    const insertData = async (transactionsReadyToSave) => {
        const { data, error } = await supabase_client
        .from("transactions")
        .upsert(transactionsReadyToSave, { onConflict: ['user_id', 'account_id', 'date', 'amount', 'description']})
        .select(); // This returns all the data of the transactions inserted, including auto-generated fields like id, created_at, etc.
        if (error) {
            console.error("Error inserting transactions:", error); // Debugging++++++++++++++++
        } else {
            console.log("Transactions inserted successfully:", data); // Debugging++++++++++++++++
        }
    }


    const saveAllTransactions = () => {
        const transactionsReadyToSave = bankStatementLowerCase.map((transaction, index) => ({
            user_id: userId,
            account_id: accountId,
            date: transaction.date,
            amount: Math.abs(Number(transaction.amount)),
            category_id: categoryValues[index],
            description: transaction.description,
        }));        
        insertData(transactionsReadyToSave);
        leaveDefineCategory();
    }

    

    // TEMPORARY FUNCTION FOR TESTING PURPOSES
    // Función para asignar categorías aleatorias a cada transacción
    const handleRandomCategories = () => {
        const randomCategories = {};
        bankStatementLowerCase.forEach((_, index) => {
            const randomIndex = Math.floor(Math.random() * categoriesInDatabase.length);
            randomCategories[index] = categoriesInDatabase[randomIndex].category_id;
        });
        setCategoryValues(randomCategories);
    }

    // Counter for the number of columns in the table
    const mainKeys = ['date', 'description', 'amount'];
    const counter = mainKeys.filter(key => bankStatementLowerCase[0][key] !== undefined).length;

    return (
        <div className='bg-blue-700 flex flex-col w-full h-full text-sm justify-center items-center gap-4 p-4 overflow-hidden'>
            <table className='w-full h-full justify-center items-center text-white text-center'>
                <thead>
                    <tr className='border-b-1 border-white'>
                        <th colSpan={counter}>Bank Statement</th>
                        <th>|</th>
                        <th colSpan={1}>Personalized<br/>Categories</th>
                    </tr>
                    <tr>
                        {bankStatementLowerCase[0].date ? <th>Date</th> : ''}
                        {bankStatementLowerCase[0].description ? <th>Description</th> : ''}
                        {bankStatementLowerCase[0].amount ? <th>Amount</th> : ''}
                        <th>|</th> 
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {/* index is needed to avoid the React warning: Each child in a list should have a unique "key" prop. */}
                    {bankStatementLowerCase.map((transaction, index) => (
                        // ME KEDE AKI, NECESITO ALMACENAR EN CATEGORYVVALUES TODAS LAS CATEGORIAS
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
                                value={categoryValues[index] ? categoryValues[index] : ''}
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
            className='bg-green-500 text-white w-full p-2 rounded-md hover:scale-105 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed '
            onClick={saveAllTransactions}
            disabled={Object.keys(categoryValues).length !== bankStatementLowerCase.length}
            >Save All</button>
            <button
            className='bg-yellow-400 text-black w-full p-2 rounded-md hover:scale-105 transition-all duration-300 mt-2'
            type='button'
            onClick={handleRandomCategories}
            >Assign random categories</button>
        </div>
    )
}

export default DefineCategory;
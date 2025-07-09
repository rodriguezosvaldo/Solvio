import React, { useState } from 'react'

const DefineCategoryAndType = ({bankStatement, setShowDefineCategoryAndType}) => {

    const [typeValues, setTypeValues] = useState({});
    const [categoryValues, setCategoryValues] = useState({});

    // Make the keys of the bankStatement object lowercase
    const bankStatementLowerCase = bankStatement.map(transaction => {
        Object.keys(transaction).forEach(key => {
            transaction[key.toLowerCase()] = transaction[key];
        });
        return transaction;
    });

    // Function to generate random values. This is a temporary function to test the app++++++++++++++++++++++++++++++++++++++++++++
    const generateRandomValues = () => {
        const types = ['income', 'expense', 'transfer'];
        const categories = ['housing', 'groceries', 'transportation', 'entertainment', 'health', 'clothing', 'other'];
        
        const randomTypeValues = {};
        const randomCategoryValues = {};
        
        bankStatementLowerCase.forEach((_, index) => {
            const randomType = types[Math.floor(Math.random() * types.length)];
            randomTypeValues[index] = randomType;
            
            // For transfers we don't assign a category, for other types we assign a random category
            if (randomType !== 'transfer') {
                randomCategoryValues[index] = categories[Math.floor(Math.random() * categories.length)];
            }
        });
        
        setTypeValues(randomTypeValues);
        setCategoryValues(randomCategoryValues);
    };

    const storeType = (e, index) => {
        setTypeValues(prev => ({
            ...prev,
            [index]: e.target.value
        }));
    }

    const storeCategory = (e, index) => {
        setCategoryValues(prev => ({
            ...prev,
            [index]: e.target.value
        }));
    }

    const saveAllTransactions = () => {
        // Modificar el codigo para que transactions solo contenga: date, amount, type y category++++++++++++++++++++++++++++++++++++++++++++
        const transactionsReadyToSave = bankStatementLowerCase.map((transaction, index) => ({
            ...transaction,
            type: typeValues[index],
            category: categoryValues[index]
        }));
        console.log("transactionsReadyToSave++++++++++", transactionsReadyToSave);
        setShowDefineCategoryAndType(false);
    }

    // Counter for the number of columns in the table
    const mainKeys = ['date', 'description', 'category', 'amount'];
    const counter = mainKeys.filter(key => bankStatementLowerCase[0][key] !== undefined).length;

    return (
        <div className='bg-blue-700 flex flex-col w-full h-full text-sm justify-center items-center gap-4 p-4 overflow-hidden'>
            <table className='w-full h-full justify-center items-center text-white text-center'>
                <thead>
                    <tr className='border-b-1 border-white'>
                        <th colSpan={counter}>Bank Statement</th>
                        <th>|</th>
                        <th colSpan={3}>Personalized<br/>Categories and Types</th>
                    </tr>
                    <tr>
                        {bankStatementLowerCase[0].date ? <th>Date</th> : ''}
                        {bankStatementLowerCase[0].description ? <th>Description</th> : ''}
                        {bankStatementLowerCase[0].category ? <th>Category</th> : ''}
                        {bankStatementLowerCase[0].amount ? <th>Amount</th> : ''}
                        <th>|</th> 
                        <th>Category</th>
                        <th>Type</th>
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
                        {transaction.category ? <td className='p-2'>{transaction.category}</td> : ''}
                        {transaction.amount ? <td className='p-2'>{transaction.amount}</td> : ''}
                        <td>|</td>
                        <td className='p-2'>
                            <select
                            className='bg-white text-black'
                            value={typeValues[index] || ''}
                            required
                            onChange={(e) => storeType(e, index)}
                            >
                                <option value="">Select Type</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                                <option value="transfer">Transfer</option>
                            </select>
                        </td>
                        <td className='p-2'>
                            <select
                            className='bg-white text-black disabled:bg-black'
                            value={categoryValues[index] || ''}
                            required
                            disabled={typeValues[index] === 'transfer'}
                            onChange={(e) => storeCategory(e, index)}
                            >
                                <option value="">Select Category</option>
                                <option value="housing">Housing</option> 
                                <option value="groceries">Groceries</option>
                                <option value="transportation">Transportation</option>
                                <option value="entertainment">Entertainment</option>
                                <option value="health">Health</option>
                                <option value="clothing">Clothing</option>
                                <option value="other">Other</option>
                            </select>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            <button 
            className='bg-green-500 text-white w-full p-2 rounded-md hover:scale-105 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed '
            onClick={saveAllTransactions}
            disabled={Object.keys(typeValues).length !== bankStatementLowerCase.length || 
                     Object.keys(categoryValues).length !== (bankStatementLowerCase.length - Object.values(typeValues).filter(type => type === 'transfer').length)}
            >Save All</button>
            {/* Button to generate random values. This is a temporary button to test the app++++++++++++++++++++++++++++++++++++++++++++ */}
            <button 
                className='bg-yellow-500 text-black px-4 py-2 rounded-md hover:scale-105 transition-all duration-300 mb-2'
                onClick={generateRandomValues}
            >
                Generate Random Values
            </button>
        </div>
    )
}

export default DefineCategoryAndType;
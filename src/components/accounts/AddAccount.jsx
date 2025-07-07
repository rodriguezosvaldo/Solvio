import React, { useState } from "react";
import supabase_client from "../../supabase/client";

const AddAccount = ({ cancelAddAccount, newAccount, userId }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: "0",
    is_active: true,
    user_id: userId,
  });
  const [loading, setLoading] = useState(false);

  //When the user types in the input fields, the data is updated in the formData state
  //e.target returns the target element (name of the input field and value entered by the user)
  const inputChange = (e) => {
    const { name, value } = e.target; 
    setFormData((prev) => {
      const updatedFormData = { ...prev }; //Create a new object with the previous data
      updatedFormData[name] = value; //Update the value of the input field
      return updatedFormData;
    });
  };

  //When the user clicks the add account button, the data is inserted into the database
  const insertData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      formData.balance = parseFloat(formData.balance) || 0; //Convert the balance to a number, if the balance is not a number, set it to 0
      const { data: formDataAccount, error } = await supabase_client
        .from("accounts")
        .insert(formData)
        .select();

      if (error) {
        console.error("Error adding account:", error);
        alert("Error adding account: " + error.message);
      } else {
        console.log("Account added successfully:", formDataAccount[0]);
        newAccount(formDataAccount[0]); //formDataAccount is an array with an object inside containing the new account data
        cancelAddAccount(); // Return to accounts list
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white p-6 w-full h-full overflow-y-auto border-2 border-yellow-500 rounded-3xl">
      <div className="flex justify-center items-center">
        <h2 className="text-2xl font-bold">New Account</h2>
      </div>

      <form onSubmit={insertData} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-lg font-semibold">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={inputChange}
            required
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
            placeholder="Enter account name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="text-lg font-semibold">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={inputChange}
            required
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
          >
            <option value="" disabled>Select an account type</option>
            <option value="cash">Cash</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
            <option value="savings">Savings</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="balance" className="text-lg font-semibold">
            Balance
          </label>
          <input
            type="number"
            id="balance"
            name="balance"
            value={formData.balance}
            onChange={inputChange}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
            placeholder="0"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white hover:shadow-gray-200 hover:shadow-lg disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
        >
          {loading ? "Adding..." : "Add Account"}
        </button>
        <button
          onClick={cancelAddAccount}
          className="bg-red-600 text-white hover:shadow-gray-200 hover:shadow-lg px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddAccount;

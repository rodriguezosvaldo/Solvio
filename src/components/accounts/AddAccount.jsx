import React, { useState } from "react";
import supabase_client from "../../supabase/client";

const AddAccount = ({ leaveAddAccount, userId, setRefreshAccounts }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
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
      const { error } = await supabase_client
        .from("accounts")
        .insert(formData)
        .select();

      if (error) {
        console.error("Error adding account:", error);
        alert("Error adding account: " + error.message);
      } else {
        setRefreshAccounts(true);
        leaveAddAccount(); // Return to accounts list
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error adding account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex sm:text-base flex-col gap-6 text-white text-xs p-6 w-full h-full justify-center items-center border-2 border-white/60 rounded-3xl">
      <div className="flex justify-center items-center mb-10">
        <h2 className="font-bold">New Account</h2>
      </div>

      <form onSubmit={insertData} className="flex flex-col gap-4 sm:w-full w-4/5 justify-center items-center">
        <div className="flex flex-col w-full gap-2">
          <label htmlFor="name" className="font-semibold">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={inputChange}
            required
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-700"
            placeholder="Enter account name"
          />
        </div>

        <div className="flex flex-col w-full gap-2 mb-10">
          <label htmlFor="type" className="font-semibold">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={inputChange}
            required
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-700"
          >
            <option value="" disabled>Select an account type</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        <div className="flex flex-col w-full justify-center items-center gap-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 sm:w-80 w-auto px-6 py-3 hover:shadow-gray-200 hover:scale-105 transition-all duration-300 hover:shadow-lg disabled:bg-gray-600 rounded-lg font-semibold"
          >
            {loading ? "Adding..." : "Add Account"}
          </button>
          <button
            onClick={leaveAddAccount}
            className="bg-red-600 sm:w-80 w-auto px-6 py-3 hover:shadow-gray-200 hover:scale-105 transition-all duration-300 hover:shadow-lg rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAccount;

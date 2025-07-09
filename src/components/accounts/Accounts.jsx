import React, { useEffect, useState, useCallback } from "react";
import CategoryAndValue from "../home/CategoryAndValue";
import AccountsByType from "./AccountsByType";
import AddAccount from "./AddAccount";
import supabase_client from "../../supabase/client";
import DefineCategoryAndType from "./DefineCategoryAndType";
import Papa from "papaparse";

const Accounts = ({ userId }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDefineCategoryAndType, setShowDefineCategoryAndType] = useState(false);
  const [bankStatement, setBankStatement] = useState([]);

  //Getting all accounts from the Accounts table
  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase_client
        .from("accounts")
        .select("*")
        .eq("is_active", true);
      if (error) {
        setError(error.message);
        console.log(error);
      } else {
        setAccounts(data);
        console.log("data+++++++++++++++++++++++++++++++++", data); //debugging+++++++++++++++++++++++++++++++++
        console.log("userId+++++++++++++++++++++++++++++++++", userId); //debugging+++++++++++++++++++++++++++++++++
      }
      setLoading(false);
    };
    fetchAccounts();
  }, []);

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


  const processCSV = useCallback((id, file) => {
    console.log("Processing CSV+++++++++++++++++++++++++++++++++");
    // Parsing the CSV file using Papa Parse library to get the bank statement in an array of objects
    Papa.parse(file, {
      header: true, // Assume that the first row is the header
      skipEmptyLines: true,
      // When parsing is done the function inside complete is executed
      complete: function (results) {
        setBankStatement(results.data);
      },
    });
  }, []);
  // Making sure that the bankStatement is not empty before showing the DefineCategoryAndType component
  useEffect(() => {
    if (bankStatement.length > 0) {
      console.log("use effect+++++++++++++++++++++++++++++++++");
      console.log("bankStatement+++++++++++++++++++++++++++++++++", bankStatement);
      setShowDefineCategoryAndType(true);
    }
  }, [bankStatement]);


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

  const handleCancelAdd = useCallback(() => {
    setShowAddForm(false);
  }, []);

  const updatingAccounts = useCallback((newAccount) => {
    setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
  }, []);

  // If showAddForm is true, render the AddAccount component
  if (showAddForm) {
    return (
      <AddAccount
        cancelAddAccount={handleCancelAdd}
        newAccount={updatingAccounts}
        userId={userId}
      />
    );
  }

  // If showDefineCategoryAndType is true, render the DefineCategoryAndType component
  if (showDefineCategoryAndType) {
    return (
      <DefineCategoryAndType
        bankStatement={bankStatement}
        setShowDefineCategoryAndType={() => setShowDefineCategoryAndType(false)}
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

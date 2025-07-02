import React, { useEffect, useState } from "react";
import Add from "./Add";
import CategoryAndValue from "../home/CategoryAndValue";
import AccountsByType from "./AccountsByType";
import supabase_client from "../../supabase/client";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Getting data from the Accounts table
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
      }
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  // Calculations for assets, liabilities, and total
  const assets = accounts
    .filter((acc) => acc.balance >= 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  const liabilities = accounts
    .filter((acc) => acc.balance < 0)
    .reduce((sum, acc) => sum + acc.balance, 0);
  const total = assets - liabilities;

  //Getting props for AccountsbyType
  const typeCash = accounts.filter((account) => account.type === "cash");
  const typeDebit = accounts.filter((account) => account.type === "debit");
  const typeCredit = accounts.filter((account) => account.type === "credit");
  const typeSavings = accounts.filter((account) => account.type === "savings");

  const processCSV = () => {
    console.log("Procesando CSV. Implementar usando AI para adaptar el CSV a la base de datos");
  };

  const deleteAccount = async (accountId) => {
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
      setAccounts(accounts.filter((account) => account.id !== accountId));
    }
  };

  if (loading) return <div>Loading accounts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col gap-8 text-white p-6 w-full overflow-y-auto border-2 border-yellow-500 rounded-3xl">
      <Add onClick={() => {}} />
      <div className="flex gap-2 w-full justify-around items-center">
        <CategoryAndValue label="Assets" value={assets} />
        <CategoryAndValue label="Liabilities" value={liabilities} />
        <CategoryAndValue label="Total" value={total} />
      </div>
      {typeCash.map((account) => (
        <AccountsByType
          type={account.type}
          totalbalance={account.balance}
          name={account.name}
          id={account.id}
          accountBalance={account.accountBalance}
          deleteAccount={() => deleteAccount(account.id)}
          processCSV={() => processCSV(account.id)}
        />
      ))}
      {typeDebit.map((account) => (
        <AccountsByType
          type={account.type}
          totalbalance={account.balance}
          name={account.name}
          id={account.id}
          accountBalance={account.accountBalance}
          deleteAccount={() => deleteAccount(account.id)}
          processCSV={() => processCSV(account.id)}
        />
      ))}
      {typeCredit.map((account) => (
        <AccountsByType
          type={account.type}
          totalbalance={account.balance}
          name={account.name}
          id={account.id}
          accountBalance={account.accountBalance}
          deleteAccount={() => deleteAccount(account.id)}
          processCSV={() => processCSV(account.id)}
        />
      ))}
      {typeSavings.map((account) => (
        <AccountsByType
          type={account.type}
          totalbalance={account.balance}
          name={account.name}
          id={account.id}
          accountBalance={account.accountBalance}
          deleteAccount={() => deleteAccount(account.id)}
          processCSV={() => processCSV(account.id)}
        />
      ))}
    </div>
  );
};

export default Accounts;

import React from "react";
import SingleAccount from "./SingleAccount";

const AccountsByType = ({ type, totalbalance, accounts, deleteAccount, processCSV, categoriesInDatabase, transactionsInDatabase }) => {
  return (
    <div className="bg-blue-950 flex flex-col gap-4 w-full justify-start items-start p-4 rounded-3xl border border-white/60">
      <div className="bg-black/30 flex w-full px-4 py-2 justify-between items-center rounded-2xl">
        <span className="text-sm text-gray-200">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        <span className="text-sm text-gray-200">Total: {totalbalance}</span>
      </div>
      <div className="flex flex-col w-full p-2 gap-4 justify-start items-start rounded-2xl">
        <div className="flex flex-col w-full gap-4 justify-between items-center p-2">
          {accounts.map((account) => (
            <SingleAccount
              key={account.accountId}
              accountId={account.accountId}
              accountName={account.accountName}
              accountType={account.accountType}
              accountBalance={account.totalBalance}
              deleteAccount={deleteAccount}
              processCSV={processCSV}
              categoriesInDatabase={categoriesInDatabase}
              transactionsInDatabase={transactionsInDatabase}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsByType;

import React from "react";
import SingleAccount from "./SingleAccount";

const AccountsByType = ({ type, totalbalance, accounts, deleteAccount, processCSV, categoriesInDatabase, transactionsInDatabase }) => {
  return (
    <div className="bg-blue-950 sm:text-base sm:p-4 text-xs text-gray-200 flex flex-col gap-4 w-full justify-start items-start p-1 rounded-3xl border border-white/60">
      <div className="bg-black/30 flex w-full px-4 py-2 justify-between items-center rounded-2xl">
        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        <span>Total: {totalbalance}</span>
      </div>
      <div className="flex flex-col w-full justify-between items-center p-2">
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
  );
};

export default AccountsByType;

import React from "react";
import SingleAccount from "./SingleAccount";

const AccountsByType = ({ type, totalbalance, accounts, deleteAccount, processCSV }) => {
  return (
    <div className="bg-blue-800/80 flex flex-col gap-2 w-full justify-start items-start p-4 rounded-3xl">
      <div className="flex w-full h-auto justify-between items-center border-2 border-gray-200 rounded-3xl p-2">
        <span className="text-sm text-gray-200">{type}</span>
        <span className="text-sm text-gray-200">Total: {totalbalance}</span>
      </div>
      <div className="flex flex-col w-full gap-4 justify-start items-start border-2 border-gray-200 rounded-3xl p-2">
        <div className="flex flex-col w-full gap-4 justify-between items-center p-2">
          {accounts.map((account) => (
            <SingleAccount
              key={account.id}
              id={account.id}
              name={account.name}
              accountBalance={account.balance}
              deleteAccount={deleteAccount}
              processCSV={processCSV}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsByType;

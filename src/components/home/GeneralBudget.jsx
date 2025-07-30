import React, { useContext } from 'react'
import TrendArrow from './TrendArrow'
import CategoryAndValue from './CategoryAndValue'
import { SolvioContext } from '../../context/SolvioContext'

const GeneralBudget = () => {

    const { assetsLastMonthInDatabase, liabilitiesLastMonthInDatabase, totalLastMonthInDatabase, assetsPreviousMonth, liabilitiesPreviousMonth, totalPreviousMonth } = useContext(SolvioContext);

    let referenceAssets;
    let popUpMessageAssets;
    let referenceLiabilities;
    let popUpMessageLiabilities;
    let referenceTotal;
    let popUpMessageTotal;
    const assetsDifference = Math.round((assetsLastMonthInDatabase - assetsPreviousMonth)*100)/100;
    if (assetsDifference > 0) {
        referenceAssets = 1;
        popUpMessageAssets = `You have ${assetsDifference} more than last month`;
    } else {
        referenceAssets = 0;
        popUpMessageAssets = `You have ${Math.abs(assetsDifference)} less than last month`;
    }
    const liabilitiesDifference = Math.round((Math.abs(liabilitiesLastMonthInDatabase) - Math.abs(liabilitiesPreviousMonth))*100)/100;
    if (liabilitiesDifference > 0) {
        referenceLiabilities = 0;
        popUpMessageLiabilities = `You have ${liabilitiesDifference} more than last month`;
    } else {
        referenceLiabilities = 1;
        popUpMessageLiabilities = `You have ${Math.abs(liabilitiesDifference)} less than last month`;
    }
    const totalDifference = Math.round((totalLastMonthInDatabase - totalPreviousMonth)*100)/100;
    if (totalDifference > 0) {
        referenceTotal = 1;
        popUpMessageTotal = `You have ${totalDifference} more than last month`;
    } else {
        referenceTotal = 0;
        popUpMessageTotal = `You have ${Math.abs(totalDifference)} less than last month`;
    }

    
    return (
        <div className='bg-black flex flex-col px-4 py-2 justify-around w-full h-full border border-white/60 rounded-3xl'>
            
            <div className='flex w-full justify-center items-center gap-4 rounded-3xl'>
                <CategoryAndValue label='Assets' value={assetsLastMonthInDatabase} color='green'/>
            
                <TrendArrow 
                reference={referenceAssets} 
                popUpMessage={popUpMessageAssets}
                />
            </div>

            <div className='flex w-full justify-center items-center gap-4 rounded-3xl'>
                <CategoryAndValue label='Liabilities' value={liabilitiesLastMonthInDatabase} color='red'/>
            
                <TrendArrow 
                reference={referenceLiabilities} 
                popUpMessage={popUpMessageLiabilities}
                />
            </div>

            <div className='flex w-full justify-center items-center gap-4 rounded-3xl'>
                <CategoryAndValue label='Total' value={totalLastMonthInDatabase}/>
            
                <TrendArrow 
                reference={referenceTotal} 
                popUpMessage={popUpMessageTotal}
                />
            </div>
            
        </div>
    )
};

export default GeneralBudget

'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
import { floatToPercent, round2SF, extractSlugFromURL } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import DebouncedPercentageInput from './DebouncedPercentageInput';
import DatePicker from 'react-datepicker';

export default function BettingTable({tableData, setUserData, apiKey, addBetsDoneData, userData, refreshColumnAfterBet}){
    console.log("Mounting betting table")

    const headings = [
            "Slug",
            "Title",
            "Mrkt %",
            "My %",
            "Market Correction",
            "Buy",
            "Return",
            "Kelly %",
            "ROI",
            "ROI per day",
            "", // button
            "" // delete
        ];

    const handleMyPChange = async (slug, value) => {
        // Convert percentage value back to a float between 0 and 1
        console.log("handleMyPChange: ", slug, value);
        const newUserProbability = parseFloat(value) / 100;
        const newRow = { slug: slug, userProbability: newUserProbability };
        // Update the user data
        const updatedUserData = tableData.map((row) => {
            if (row.slug === slug) {
                return newRow;
            }
            return row;
        });
        setUserData(updatedUserData);
    };

    const handleDeleteRow = (slug) => {
        const updatedData = [...tableData];
        const index = updatedData.findIndex(row => row.slug === slug);
        updatedData.splice(index, 1);
        
        // Transform the data
        const transformedData = updatedData.map((item) => {
            return {
                slug: item.slug,
                userProbability: item.userProbability,
            };
        });
        console.log("Data after delete: ", transformedData);
        setUserData(transformedData);
    };

    const handleBet = async (slug, outcomeToBuy, amountToPay) => {
        await placeBetBySlug(apiKey, slug, amountToPay, outcomeToBuy)
            .then(() => {
                addBetsDoneData(slug, outcomeToBuy, amountToPay);
                console.log("Bet placed successfully on ", slug, outcomeToBuy, amountToPay);
                refreshColumnAfterBet(slug)
            })
            .catch((error) => {
                console.log(error)
                alert(`Error placing bet. ${error}`);
            });
    }

    return (
        <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                {headings.map((heading, i) => {
                    return <th key={i} className="border px-4 py-2 uppercase">{heading}</th>
                })}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

                {tableData.map((row) => (
                    <tr key={row.slug}>
                        <td className="border px-4 py-2 w-32 whitespace-normal">{row.slug}</td>
                        <td className="border px-4 py-2 w-64 whitespace-normal">{row.title}</td>
                        <td className="border px-4 py-2">{floatToPercent(row.marketP)}</td>
                        <td className="border px-4 py-2">
                            <DebouncedPercentageInput
                                slug={row.slug}
                                initialValue={row.userProbability * 100}
                                onDebouncedChange={handleMyPChange}
                            />
                        </td>
                        {/* <td className="border px-4 py-2">
                            <DatePicker
                                id="marketCorrectionTime"
                                name="marketCorrectionTime"
                                selected={marketCorrectionTime}
                                onChange={handleMarketCorrectionTimeChange}
                                className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </td> */}
                        <td className="border px-4 py-2">{row.buy}</td>
                        {/*<td className="border px-4 py-2">{floatToPercent(row.marketWinChance)}</td>
                        <td className="border px-4 py-2">{floatToPercent(row.myWinChance)}</td>*/}
                        <td className="border px-4 py-2">{round2SF(row.marketReturn)}</td>
                        <td className="border px-4 py-2">{round2SF(row.kellyPerc)}</td>
                        {/*<td className="border px-4 py-2">{round2SF(row.betEVreturn)}</td>*/}
                        <td className="border px-4 py-2">{round2SF(row.rOI)}</td>
                        <td><LoadingButton passOnClick={() => handleBet(row.slug, row.buy, 100)} buttonText={"Bet M100"} /></td>
                        <td className="border px-4 py-2"><button onClick={() => handleDeleteRow(row.slug)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button></td>
                    </tr>
                ))}
            </tbody>

        </table>

    )
}

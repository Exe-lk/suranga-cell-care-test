import type { NextApiRequest, NextApiResponse } from 'next';
import {
	createstockOut,
	getAllSubStockData,
	getstockInByDate,
	updateSubStock,
} from '../../../service/stockInOutDissService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	// #region agent log
	const startTime = Date.now();
	const logEntry1 = {location:'pages/api/stockInOut/route1.ts:11',message:'API route handler entry',data:{method:req.method,query:req.query,hasBody:!!req.body},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'};
	console.log('[DEBUG]', JSON.stringify(logEntry1));
	fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry1)}).catch(()=>{});
	// #endregion
	try {
		switch (req.method) {
			case 'POST': {
				const { model } = req.body;
				if (!model) {
					res.status(400).json({ error: 'stock In name is required' });
					return;
				}
				// console.log(req.body)
				const id = await createstockOut(req.body);
				res.status(201).json({ message: 'stock In created', id });
				break;
			}
			case 'GET': {
				const { date, searchTerm } = req.query;
				
				// #region agent log
				const logEntry2 = {location:'pages/api/stockInOut/route1.ts:28',message:'Before getstockInByDate call',data:{date:date as string||'',searchTerm:searchTerm as string||''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'};
				console.log('[DEBUG]', JSON.stringify(logEntry2));
				fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry2)}).catch(()=>{});
				// #endregion
				
				// Use the updated service function that supports search terms
				const queryStartTime = Date.now();
				const stockData = await getstockInByDate(
					date as string || '', 
					searchTerm as string || ''
				);
				const queryDuration = Date.now() - queryStartTime;
				
				// #region agent log
				const logEntry3 = {location:'pages/api/stockInOut/route1.ts:36',message:'After getstockInByDate call',data:{queryDuration,dataLength:stockData?.length||0,hasData:!!stockData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'};
				console.log('[DEBUG]', JSON.stringify(logEntry3));
				fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry3)}).catch(()=>{});
				// #endregion
				
				console.log(stockData);
				res.status(200).json(stockData);
				break;
			}
			case 'PUT': {
				const { id, subid, values } = req.body;
				// console.log(req.body)
				await updateSubStock(subid, values);
				res.status(200).json({ message: 'stock In updated' });
				break;
			}
			default: {
				res.setHeader('Allow', ['POST', 'GET', 'PUT']);
				res.status(405).end(`Method ${req.method} Not Allowed`);
				break;
			}
		}
		// #region agent log
		const totalDuration = Date.now() - startTime;
		const logEntry4 = {location:'pages/api/stockInOut/route1.ts:52',message:'API route handler success exit',data:{totalDuration,method:req.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'};
		console.log('[DEBUG]', JSON.stringify(logEntry4));
		fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry4)}).catch(()=>{});
		// #endregion
	} catch (error) {
		// #region agent log
		const totalDuration = Date.now() - startTime;
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorStack = error instanceof Error ? error.stack : undefined;
		const logEntry5 = {location:'pages/api/stockInOut/route1.ts:54',message:'API route handler error catch',data:{totalDuration,errorMessage,errorStack,method:req.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'};
		console.log('[DEBUG]', JSON.stringify(logEntry5));
		console.error('[ERROR]', error);
		fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry5)}).catch(()=>{});
		// #endregion
		res.status(500).json({ error: 'An error occurred' });
	}
}

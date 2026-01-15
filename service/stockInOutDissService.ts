// import { firestore } from '../firebaseConfig';
// import {
// 	addDoc,
// 	collection,
// 	getDocs,
// 	doc,
// 	updateDoc,
// 	deleteDoc,
// 	getDoc,
// 	query,
// 	where,
// 	Timestamp,
// 	orderBy,
// 	limit,
// 	setDoc,
// } from 'firebase/firestore';

// export const createstockIn = async (values: any) => {
// 	console.log(values);
// 	values.status = true;
// 	values.timestamp = Timestamp.now();
// 	values.barcodePrefix = values.barcode.toString().slice(0, 4);
// 	const docRef = doc(firestore, 'Stock', values.barcode); // Use barcode as document ID
// 	await setDoc(docRef, values);
// 	const { quantity } = values;
// 	const subCollectionRef = collection(docRef, 'subStock');

// 	let uniqueId = 1000;

// 	for (let i = 0; i < quantity; i++) {
// 		const barcodeValue = values.barcode + uniqueId;
// 		await setDoc(doc(subCollectionRef, barcodeValue), {
// 			id: docRef.id,
// 			uniqueId: uniqueId.toString(),
// 			status: false,
// 			barcode: barcodeValue,
// 			print: false,
// 		});
// 		uniqueId += 1;
// 	}

// 	return docRef.id;
// };

// export const getstockInByDate = async (date: string, searchTerm: any) => {
// 	// if (searchTerm == '') {
// 		const q = query(
// 			collection(firestore, 'Stock'),
// 			where('status', '==', true),
// 			where('date', '==', date),
// 		);

// 		const querySnapshot = await getDocs(q);
// 		const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

// 		return data;
	
// };

// export const getAllSubStockData = async () => {
// 	try {
// 		const stockCollectionRef = collection(firestore, 'Stock');
// 		const stockSnapshot = await getDocs(stockCollectionRef);
// 		let allSubStockData: any[] = [];
// 		for (const stockDoc of stockSnapshot.docs) {
// 			const stockDocId = stockDoc.id;
// 			const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
// 			const subStockSnapshot = await getDocs(subStockCollectionRef);
// 			const subStockData = subStockSnapshot.docs.map((subDoc) => ({
// 				id: subDoc.id,
// 				parentStockId: stockDocId,
// 				...subDoc.data(),
// 			}));
// 			allSubStockData = allSubStockData.concat(subStockData);
// 		}
// 		return allSubStockData;
// 	} catch (error) {
// 		console.error('Error fetching all subStock data:', error);
// 		throw new Error('Failed to fetch subStock data.');
// 	}
// };

// export const updateSubStock = async (stockDocId: string, subStockDocId: string, values: any) => {
// 	try {
// 		const subStockDocRef = doc(firestore, 'Stock', stockDocId, 'subStock', subStockDocId);
// 		await updateDoc(subStockDocRef, values);
// 		return { success: true, message: 'SubStock status updated successfully.' };
// 	} catch (error) {
// 		console.error('Error updating subStock:', error);
// 		throw new Error('Failed to update subStock.');
// 	}
// };
// export const updateSubStockById = async (subStockId: string) => {
// 	try {
// 		const stockCollectionRef = collection(firestore, 'Stock');
// 		const stockSnapshot = await getDocs(stockCollectionRef);

// 		for (const stockDoc of stockSnapshot.docs) {
// 			const stockDocId = stockDoc.id;
// 			const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
// 			const subStockQuery = query(subStockCollectionRef, where('__name__', '==', subStockId));
// 			const subStockSnapshot = await getDocs(subStockQuery);

// 			if (!subStockSnapshot.empty) {
// 				const subStockDocRef = doc(firestore, 'Stock', stockDocId, 'subStock', subStockId);
// 				await updateDoc(subStockDocRef, { status: true });
// 				return { success: true, message: 'SubStock status updated successfully.' };
// 			}
// 		}

// 		throw new Error('SubStock not found.');
// 	} catch (error) {
// 		console.error('Error updating subStock:', error);
// 		throw new Error('Failed to update subStock.');
// 	}
// };

// const findLargestUniqueId = (data: any[]) => {
// 	if (!data || data.length === 0) {
// 		throw new Error('No data available to find uniqueId.');
// 	}
// 	const largestUniqueId = data.reduce((max, item) => {
// 		const uniqueId = parseInt(item.uniqueId, 10);
// 		return uniqueId > max ? uniqueId : max;
// 	}, 0);
// 	return largestUniqueId;
// };

// // export const getstockIns = async () => {
// // 	const q = query(collection(firestore, 'Stock'), where('status', '==', true));
// // 	const querySnapshot = await getDocs(q);
// // 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// // };
// export const getstockIns = async () => {
// 	try {
// 		const q = query(collection(firestore, 'Stock'), where('status', '==', true));
// 		const querySnapshot = await getDocs(q);
// 		const stockData = [];

// 		for (const stockDoc of querySnapshot.docs) {
// 			const stockDocId = stockDoc.id;
// 			const stockInfo: any = { id: stockDocId, ...stockDoc.data(), subStock: [] };

// 			const subStockCollectionRef = collection(firestore, 'Stock', stockDocId, 'subStock');
// 			const subStockSnapshot = await getDocs(subStockCollectionRef);

// 			const subStockData = subStockSnapshot.docs.map((subDoc) => ({
// 				id: subDoc.id,
// 				...subDoc.data(),
// 			}));

// 			stockInfo.subStock = subStockData;
// 			stockData.push(stockInfo);
// 		}

// 		return stockData;
// 	} catch (error) {
// 		console.error('Error fetching stockIns with subStock data:', error);
// 		throw new Error('Failed to fetch stockIns and subStock data.');
// 	}
// };
// export const getstockInById = async (id: string) => {
// 	// const stockInRef = doc(firestore, 'Stock', id);
// 	// const stockInSnap = await getDoc(stockInRef);
// 	// if (stockInSnap.exists()) {
// 	// 	return { id: stockInSnap.id, ...stockInSnap.data() };
// 	// } else {
// 	// 	return null;
// 	// }

// 	const q = query(collection(firestore, 'Stock'), where('barcodePrefix', '==', id));
// 	const querySnapshot = await getDocs(q);
// 	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// export const updatestockIn = async (id: string, quantity: string) => {
// 	const stockInRef = doc(firestore, 'ItemManagementDis', id);
// 	await updateDoc(stockInRef, { quantity });
// };

// export const createstockOut = async (data: any) => {
// 	data.status = true;
// 	data.timestamp = Timestamp.now();
// 	const docRef = await addDoc(collection(firestore, 'Stock'), data);
// 	return docRef.id;
// };


import { supabase } from '../lib/supabase';

export const createstockIn = async (values: any) => {
	try {
	  console.log(values);
	  values.status = true;
	  values.timestamp = new Date().toISOString(); // Supabase uses ISO date strings
	  values.barcodePrefix = values.barcode.toString().slice(0, 4);
  
	  // Insert into Stock table
	  const { data: stockData, error: stockError } = await supabase
		.from('Stock')
		.insert([values])
		.select(); // get inserted row
  
	  if (stockError) throw stockError;
  
	  const stockId = stockData[0].id;
	  const { quantity } = values;
  
	  let uniqueId = 1000;
	  const subStockRows = [];
  
	  for (let i = 0; i < quantity; i++) {
		const barcodeValue = values.barcode + uniqueId;


		subStockRows.push({
		id:barcodeValue,
		  stock_id: values.barcode, // Foreign key to Stock table
		  uniqueId: uniqueId.toString(),
		  status: false,
		  barcode: barcodeValue,
		  print: false,
		});
		uniqueId += 1;
	  }
  
	  // Insert all subStock at once
	  const { error: subStockError } = await supabase
		.from('subStock')
		.insert(subStockRows);
  
	  if (subStockError) throw subStockError;
  
	  return stockId;
	} catch (error) {
	  console.error('Error creating stockIn:', error);
	  throw error;
	}
  };
  export const getstockInByDate = async (date: string, searchTerm: any, page: number = 1, limit: number = 500) => {
	// #region agent log
	const funcStartTime = Date.now();
	const logEntry6 = {location:'service/stockInOutDissService.ts:240',message:'getstockInByDate function entry',data:{date:date||'',searchTerm:searchTerm||'',page,limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'};
	console.log('[DEBUG]', JSON.stringify(logEntry6));
	fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry6)}).catch(()=>{});
	// #endregion
	
	// Calculate range for pagination
	const from = (page - 1) * limit;
	const to = from + limit - 1;
	
	// First, get total count for pagination
	let countQuery = supabase
	  .from('Stock')
	  .select('*', { count: 'exact', head: true })
	  .eq('status', true);
	
	if (date) {
	  countQuery = countQuery.eq('date', date);
	}
	
	if (searchTerm) {
	  countQuery = countQuery.or(`barcode.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,suppName.ilike.%${searchTerm}%`);
	}
	
	const { count, error: countError } = await countQuery;
	
	if (countError) {
	  console.error('Error fetching count:', countError);
	  return { data: [], total: 0 };
	}
	
	// Now get the paginated data
	let query = supabase
	  .from('Stock')
	  .select('*')
	  .eq('status', true);
	
	// Add date filter if provided
	if (date) {
	  query = query.eq('date', date);
	}
	
	// Add search filter if provided
	if (searchTerm) {
	  query = query.or(`barcode.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,suppName.ilike.%${searchTerm}%`);
	}
	
	// Apply ordering and pagination
	query = query.order('code', { ascending: false }).range(from, to);
  
	// #region agent log
	const queryStartTime = Date.now();
	const logEntry7 = {location:'service/stockInOutDissService.ts:256',message:'Before Supabase query execution',data:{hasDateFilter:!!date,hasSearchFilter:!!searchTerm,page,limit,from,to},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,E'};
	console.log('[DEBUG]', JSON.stringify(logEntry7));
	fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry7)}).catch(()=>{});
	// #endregion
	
	const { data, error } = await query;
	const queryDuration = Date.now() - queryStartTime;
	
	// #region agent log
	const logEntry8 = {location:'service/stockInOutDissService.ts:258',message:'After Supabase query execution',data:{queryDuration,hasError:!!error,hasData:!!data,dataLength:data?.length||0,errorMessage:error?.message||'',errorCode:error?.code||'',errorDetails:error?.details||''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,E'};
	console.log('[DEBUG]', JSON.stringify(logEntry8));
	if (error) console.error('[ERROR] Supabase query error:', error);
	fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry8)}).catch(()=>{});
	// #endregion
  
	if (error) {
	  console.error('Error fetching stock by date with search:', error);
	  // #region agent log
	  const funcDuration = Date.now() - funcStartTime;
	  const logEntry9 = {location:'service/stockInOutDissService.ts:262',message:'getstockInByDate error path',data:{funcDuration,errorMessage:error.message,errorCode:error.code,errorDetails:error.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,E'};
	  console.log('[DEBUG]', JSON.stringify(logEntry9));
	  fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry9)}).catch(()=>{});
	  // #endregion
	  return { data: [], total: 0 };
	}
  
	// #region agent log
	const funcDuration = Date.now() - funcStartTime;
	const logEntry10 = {location:'service/stockInOutDissService.ts:267',message:'getstockInByDate success exit',data:{funcDuration,dataLength:data?.length||0,total:count},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'};
	console.log('[DEBUG]', JSON.stringify(logEntry10));
	fetch('http://127.0.0.1:7243/ingest/f52832bd-be78-4014-82a2-b25ab143e235',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry10)}).catch(()=>{});
	// #endregion
	return { data: data || [], total: count || 0 };
  };
  export const getAllSubStockData = async () => {
	try {
	  const { data, error } = await supabase
		.from('subStock')
		.select('*');
  
	  if (error) throw error;
  
	  return data;
	} catch (error) {
	  console.error('Error fetching all subStock data:', error);
	  throw error;
	}
  };
  export const updateSubStock = async (subStockDocId: string, values: any) => {
	try { 
		console.log(subStockDocId)
	  const { error } = await supabase
		.from('subStock')
		.update(values)
		.eq('barcode', subStockDocId);
  
	  if (error) throw error;
  
	  return { success: true, message: 'SubStock updated successfully.' };
	} catch (error) {
	  console.error('Error updating subStock:', error);
	  throw error;
	}
  };
  export const updateSubStockById = async (subStockId: string) => {
	try {
	  const { error } = await supabase
		.from('subStock')
		.update({ status: true })
		.eq('barcode', subStockId);
  
	  if (error) throw error;
  
	  return { success: true, message: 'SubStock status updated successfully.' };
	} catch (error) {
	  console.error('Error updating subStock by ID:', error);
	  throw error;
	}
  };
  export const getstockIns = async () => {
	try {
	  const { data: stockData, error: stockError } = await supabase
		.from('Stock')
		.select(`
		  *
		`)
		.eq('status', true);
  
	  if (stockError) throw stockError;
  
	  return stockData;
	} catch (error) {
	  console.error('Error fetching stockIns with subStock:', error);
	  throw error;
	}
  };
  export const getstockInById = async (id: string) => {
	const { data, error } = await supabase
	  .from('Stock')
	  .select('*')
	  .eq('barcodePrefix', id);
  
	if (error) {
	  console.error('Error fetching stock by ID:', error);
	  throw error;
	}
  
	return data;
  };
  export const updatestockIn = async (id: string, quantity: string) => {
	const { error } = await supabase
	  .from('ItemManagementDis')
	  .update({ quantity })
	  .eq('id', id);
  
	if (error) {
	  console.error('Error updating stockIn:', error);
	  throw error;
	}
  };
  export const createstockOut = async (data: any) => {
	data.status = true;
	data.timestamp = new Date().toISOString();
  
	const { data: newStock, error } = await supabase
	  .from('Stock')
	  .insert([data])
	  .select();
  
	if (error) {
	  console.error('Error creating stockOut:', error);
	  throw error;
	}
  
	return newStock[0].id;
  };

export const getStockOutByTechnician = async (technicianId: string) => {
	try {
		const { data, error } = await supabase
			.from('Stock')
			.select('*')
			.eq('technicianNum', technicianId)
			.eq('stock', 'stockOut')
			.eq('status', true);

		if (error) {
			console.error('Error fetching stock out by technician:', error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error fetching stock out by technician:', error);
		throw error;
	}
};
  
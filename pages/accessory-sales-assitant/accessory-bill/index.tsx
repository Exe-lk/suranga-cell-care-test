import React, { useEffect, useRef, useState } from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import 'react-simple-keyboard/build/css/index.css';
import Swal from 'sweetalert2';
import Card, { CardBody, CardFooter } from '../../../components/bootstrap/Card';
import { Dropdown } from 'primereact/dropdown';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import {
	useGetStockInOutsQuery as useGetStockInOutsdisQuery,
	useUpdateStockInOutMutation,
} from '../../../redux/slices/stockInOutAcceApiSlice';
import MyDefaultHeader from '../../_layout/_headers/AccessoryBillHeader';
import { Creatbill, Getbills } from '../../../service/accessoryService';
import Page from '../../../layout/Page/Page';
import Spinner from '../../../components/bootstrap/Spinner';
import { useGetItemAccesQuery } from '../../../redux/slices/itemManagementAcceApiSlice';
import { number } from 'prop-types';

function index() {
	const [orderedItems, setOrderedItems] = useState<any[]>([]);
	const { data: Accstock, error, isLoading } = useGetStockInOutsdisQuery(undefined);
	const [updateStockInOut] = useUpdateStockInOutMutation();
	const { data: itemAcces } = useGetItemAccesQuery(undefined);
	const [items, setItems] = useState<any[]>([]);
	const [selectedBarcode, setSelectedBarcode] = useState<any[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<string>('');
	const [quantity, setQuantity] = useState<any>(1);
	const [payment, setPayment] = useState(true);
	const [amount, setAmount] = useState<number>(0);
	const [id, setId] = useState<number>(0);
	const [discount, setDiscount] = useState<number>(0);
	const [casher, setCasher] = useState<any>({});
	const currentDate = new Date().toLocaleDateString('en-CA');
	const currentTime = new Date().toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
	});
	const [isQzReady, setIsQzReady] = useState(false);
	const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
	const [contact, setContact] = useState<number>(0);
	const [customer, setCustomer] = useState<any[]>([]);
	const [status, setStaus] = useState<boolean>(true);
	const [returnstatus, setReturnstatus] = useState<boolean>(false);
	const [returndata, setReturndata] = useState<any>('');
	const [returnid, setReturnid] = useState<any>('');
	const [name, setName] = useState<string>('');
	const dropdownRef = useRef<Dropdown>(null);
	const quantityRef = useRef<HTMLInputElement>(null);
	const discountRef = useRef<HTMLInputElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const addRef = useRef<any>(null);
	const endRef = useRef<any>(null);
	const invoiceRef: any = useRef();
	useEffect(() => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js';
		script.async = true;

		script.onload = () => {
			console.log('QZ Tray script loaded.');
			setIsQzReady(true);
		};

		script.onerror = () => {
			console.error('Failed to load QZ Tray script.');
		};

		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const querySnapshot = await getDocs(collection(firestore, 'customer'));
				const dataList = querySnapshot.docs.map((doc) => ({
					...doc.data(),
				}));
				setCustomer(dataList);
				// console.log(dataList);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [orderedItems]);

	const contactchanget = async (value: any) => {
		if (value.length > 1 && value.startsWith('0')) {
			value = value.substring(1);
		}
		setContact(value);
		if (value.length === 9) {
			const matchingCustomer = customer.find((customer) => customer.contact === value);

			if (matchingCustomer) {
				const { customer: customerId, contact, name } = matchingCustomer; // Extract specific fields
				setName(name);
				setStaus(true);
			} else {
				console.log('No matching customer found for the contact:', value);
				setStaus(false);
			}
		}
	};
	useEffect(() => {
		const fetchData = async () => {
			try {
				const querySnapshot = await getDocs(collection(firestore, 'accessorybill'));
				const dataList = querySnapshot.docs.map((doc) => ({
					id: parseInt(doc.id, 10), // Ensure `id` is a number
					...doc.data(),
				}));
				// console.log('Data List:', dataList);
				const largestId = dataList.reduce(
					(max, item) => (item.id > max ? item.id : max),
					0,
				);
				// console.log('Largest ID:', largestId);
				setId(largestId + 1);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [orderedItems]);

	useEffect(() => {
		if (dropdownRef.current) {
			dropdownRef.current.focus();
		}
	}, [Accstock]);
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (document.activeElement === nameRef.current) {
				return;
			}
			if (event.key === 'Shift') {
				// No need to convert to lowercase
				dropdownRef.current?.focus();
			}
			if (event.key.toLowerCase() == 'c') {
				// console.log(orderedItems.length);
				addbill();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [orderedItems]);

	const handleDropdownKeyPress = (e: React.KeyboardEvent) => {
		if (
			!/[0-9]/.test(e.key) &&
			!['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(e.key)
		) {
			e.preventDefault();
		}
		if (e.key === 'Enter') {
			if (quantityRef.current) {
				quantityRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowRight') {
			if (inputRef.current) {
				inputRef.current.focus();
			}
			e.preventDefault();
		}
	};
	const salechange = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			if (quantityRef.current) {
				quantityRef.current.focus();
			}
			e.preventDefault();
		}
	};
	const handleaddKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handlePopupOk();
		}
		if (e.key === 'ArrowDown') {
			if (discountRef.current) {
				discountRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowUp') {
			if (dropdownRef.current) {
				dropdownRef.current.focus();
			}
			e.preventDefault();
		}
	};
	const addchange = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handlePopupOk();
		}
		if (e.key === 'ArrowRight') {
			if (inputRef.current) {
				inputRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowUp') {
			if (dropdownRef.current) {
				dropdownRef.current.focus();
			}
			e.preventDefault();
		}
	};
	const discountchange = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			if (quantityRef.current) {
				quantityRef.current.focus();
			}
			e.preventDefault();
		}
		if (e.key === 'ArrowDown') {
			if (endRef.current) {
				endRef.current.focus();
			}
			e.preventDefault();
		}
	};

	// useEffect(() => {
	// 	const cashier = localStorage.getItem('user');
	// 	if (cashier) {
	// 		const jsonObject = JSON.parse(cashier);
	// 		console.log(jsonObject);
	// 		setCasher(jsonObject);
	// 	}
	// }, []);

	// Save current orderedItems as a draft
	const handleSaveDraft = () => {
		if (orderedItems.length === 0) {
			Swal.fire(
				'Error',
				name ? 'Enter customer name' : 'No items to save as draft.',
				'error',
			);
			return;
		}
		// console.log(name);
		if (name == '') {
			Swal.fire('Error', 'Enter customer name', 'error');
			return;
		}

		const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
		const newDraft = {
			draftId: new Date().getTime(), // Unique identifier
			orders: orderedItems,
			name: name,
			contact: contact,
		};
		localStorage.setItem('drafts', JSON.stringify([...savedDrafts, newDraft]));
		setOrderedItems([]);
		Swal.fire('Success', 'Draft saved successfully.', 'success');
	};

	// Load a selected draft into orderedItems
	const handleLoadDraft = (draft: any) => {
		if (draft && draft.orders) {
			setOrderedItems(draft.orders);
			setCurrentDraftId(draft.draftId); // Set the orders part of the draft
			setContact(draft.contact);
			setName(draft.name);
			Swal.fire('Success', 'Draft loaded successfully.', 'success');
		} else {
			Swal.fire('Error', 'Invalid draft data.', 'error');
		}
	};
	useEffect(() => {
		const fetchData = async () => {
			try {
				const updatedAccstock = Accstock.map((item: any) => ({
					...item,
					currentQuantity: item.quantity,
					discount: 0,
					// Add currentQuantity field
					// Optionally remove the old quantity field if not needed
				}));

				const result1 = updatedAccstock.filter((item: any) => item.stock === 'stockIn');
				const combinedResult = [...result1];
				setItems(combinedResult);
				// console.log(combinedResult);
			} catch (error) {
				console.error('Error fetching data: ', error);
			}
		};

		fetchData();
	}, [isLoading]);

	const handlePopupOk = async () => {
		if (!selectedProduct || quantity <= 0 || quantity > 25) {
			Swal.fire('Error', 'Please select a product and enter a valid quantity.', 'error');
			return;
		}
		const selectedItem = items.find((item) => item.barcode === selectedProduct);
		if (selectedItem) {
			// console.log(selectedItem);
			if (selectedItem.type == 'displaystock') {
				const existingItemIndex = orderedItems.findIndex(
					(item) => item.barcode.slice(0, 4) === selectedProduct.slice(0, 4),
				);
				const existingItem = orderedItems.find((item) => item.barcode === selectedProduct);
				if (!existingItem) {
					const barcode = [...selectedBarcode, selectedProduct];
					setSelectedBarcode(barcode);
				}
				let updatedItems;
				if (existingItemIndex !== -1) {
					updatedItems = [...orderedItems];
					updatedItems[existingItemIndex] = {
						...selectedItem,
						quantity: updatedItems[existingItemIndex].quantity + 1,
					};
				} else {
					updatedItems = [...orderedItems, { ...selectedItem, quantity: 1 }];
				}
				setOrderedItems(updatedItems);
			} else {
				const matchingItem = itemAcces?.find(
					(accessItem: any) => accessItem.code === selectedProduct.substring(0, 4),
				);

				const existingItemIndex = orderedItems.findIndex(
					(item) => item.barcode === selectedProduct,
				);
				let updatedItems;
				if (existingItemIndex !== -1) {
					updatedItems = [...orderedItems];
					updatedItems[existingItemIndex] = {
						...selectedItem,
						quantity: Number(quantity),
					};
				} else {
					updatedItems = [
						...orderedItems,
						{ ...selectedItem, quantity, warranty: matchingItem?.warranty },
					];
				}
				setOrderedItems(updatedItems);
			}
			setSelectedProduct('');
			setQuantity(1);
			if (dropdownRef.current) {
				dropdownRef.current.focus();
			}
			Swal.fire({
				title: 'Success',
				text: 'Product added/replaced successfully.',
				icon: 'success',
				showConfirmButton: false,
				timer: 1000,
			});
		} else {
			Swal.fire('Error', 'Selected item not found.', 'error');
		}
	};

	const handleDeleteItem = (code: string) => {
		const updatedItems = orderedItems.filter((item) => item.barcode !== code);
		setOrderedItems(updatedItems);
		Swal.fire({
			title: 'Success',
			text: 'Item removed successfully.',
			icon: 'success',
			showConfirmButton: false,
			timer: 1000,
		});
	};

	const calculateSubTotal = () => {
		return orderedItems
			.reduce((sum, val) => sum + val.sellingPrice * val.quantity, 0)
			.toFixed(2);
	};

	const addbill = async () => {
		if (orderedItems.length > 0) {
			try {
				const result = await Swal.fire({
					title: 'Are you sure?',
					text: 'You will not be able to recover this status!',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Yes, End Bill!',
				});

				if (result.isConfirmed) {
					const process = Swal.fire({
						title: 'Processing...',
						html: 'Please wait while the data is being processed.<br><div class="spinner-border" role="status"></div>',
						allowOutsideClick: false,
						showCancelButton: false,
						showConfirmButton: false,
					});
					const totalAmount = calculateSubTotal();
					const currentDate = new Date();
					const formattedDate = currentDate.toLocaleDateString();
					const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
					const updatedDrafts = savedDrafts.filter(
						(draft: any) => draft.draftId !== currentDraftId,
					);
					localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
					if (!status) {
						await addDoc(collection(firestore, 'customer'), { name, contact });
					}
					const values = {
						orders: orderedItems,
						time: currentTime,
						date: formattedDate,
						// casheir: casher.email,
						amount: Number(totalAmount),
						type: payment ? 'cash' : 'card',
						print: true,
						discount: discount,
						totalDiscount: Number(getAllDiscounts() + Number(discount)),
						netValue:
							calculateSubTotal() -
							(getAllDiscounts() + Number(discount)) -
							Number(returndata?.sold_price ?? 0),
						id: id,
						name: name,
						contact: contact,
						returnid: returnid,
						returnstatus: returnstatus,
					};
					await Creatbill(values);
					for (const item of orderedItems) {
						const { cid, barcode, quantity } = item; // Destructure the fields from the current item
						const id = cid;
						const barcodePrefix = barcode.slice(0, 4);

						const matchingItem = itemAcces?.find(
							(accessItem: any) => accessItem.code === barcodePrefix,
						);
						// console.log(matchingItem);
						if (matchingItem) {
							const quantity1 = matchingItem.quantity;

							const updatedQuantity = quantity1 - quantity;
							try {
								// Call the updateStockInOut function to update the stock
								await updateStockInOut({ id, quantity: updatedQuantity }).unwrap();
							} catch (error) {
								console.error(`Failed to update stock for ID: ${id}`, error);
							}
						} else {
							console.warn(`No matching item found for barcode: ${barcode}`);
						}
					}

					setOrderedItems([]);
					setAmount(0);
					setDiscount(0);
					setContact(0);
					setName('');
					setReturnstatus(false)
					setReturnid('')
					setReturndata('')

					const printContent: any = invoiceRef.current.innerHTML;

					// Temporarily hide other content on the page
					const originalContent = document.body.innerHTML;
					document.body.innerHTML = printContent;

					// Trigger the print dialog
					window.print();

					// Restore the original content after printing
					document.body.innerHTML = originalContent;

					Swal.fire({
						title: 'Success',
						text: 'Bill has been added successfully.',
						icon: 'success',
						showConfirmButton: false,
						timer: 1000,
					});
					window.location.reload();
				}
			} catch (error) {
				console.error('Error during handleUpload: ', error);
				alert('An error occurred. Please try again later.');
			}
		} else {
			Swal.fire('Warning..!', 'Insufficient Item', 'error');
		}
	};

	const startbill = async () => {
		if (orderedItems.length > 0) {
			const result = await Swal.fire({
				title: 'Are you sure?',
				// text: 'You will not be able to recover this status!',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, Cancel Bill!',
			});

			if (result.isConfirmed) {
				const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]');
				const updatedDrafts = savedDrafts.filter(
					(draft: any) => draft.draftId !== currentDraftId,
				);
				await setCurrentDraftId(null);
				localStorage.setItem('drafts', JSON.stringify(updatedDrafts));

				setOrderedItems([]);
				setAmount(0);
				setQuantity(1);
				setName('');
				setContact(0);
				setSelectedProduct('');
				if (dropdownRef.current) {
					dropdownRef.current.focus();
				}
			}
		} else {
			setOrderedItems([]);
			setAmount(0);
			setQuantity(1);
			setSelectedProduct('');
			if (dropdownRef.current) {
				dropdownRef.current.focus();
			}
		}
	};

	const handleDiscountChange = (
		price: number,
		index: number,
		discount: any,
		quentity: number,
	) => {
		if (price <= discount) {
			Swal.fire('Warning..!', 'Insufficient Item', 'error');
			discount = 0;
		}
		setOrderedItems((prevItems) =>
			prevItems.map(
				(item, i) =>
					i === index
						? {
								...item,
								discount: (price - Number(discount)) * quentity,
								finalsellingprice: discount,
						  }
						: item, // Update only the specific item
			),
		);
	};
	const getAllDiscounts = (): number => {
		if (!orderedItems || orderedItems.length === 0) {
			return 0;
		}
		return orderedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
	};

	const chunkItems = (array: any[], chunkSize: number) => {
		const chunks = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}

		return chunks;
	};

	// Split orderedItems into chunks of 5
	const chunks = chunkItems(orderedItems, 5);
	// console.log(chunks);

	const handlereturn = async (id: any) => {
		try {
			console.log(id);
			const docRef = doc(firestore, 'return', id);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				// Get document data along with its ID
				const data = { id: docSnap.id, ...docSnap.data() };
				console.log('Document Data:', data);
				setReturndata(data);
			} else {
				Swal.fire('Warning..!', 'NO Return Id', 'error');
				setReturnid('');
				return null;
			}
		} catch (error) {
			console.error('Error fetching document:', error);
		}
	};
	if (isLoading) {
		// console.log(isLoading);
		return (
			<PageWrapper>
				<Page>
					<div className='row h-100 py-5'>
						<div className='col-12 text-center py-5 my-5'>
							<Spinner
								tag={'div'}
								color={'primary'}
								isGrow={false}
								size={50}
								className={''}
							/>
							<br />
							<br />
							<h2>Please Wait</h2>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
	}
	return (
		<>
			<PageWrapper className=''>
				<MyDefaultHeader
					onSaveDraft={handleSaveDraft}
					onLoadDraft={handleLoadDraft}
					startBill={startbill}
					setReturnstatus={setReturnstatus}
					returnstatus={returnstatus}
					count={orderedItems.length}
				/>
				<div className='row m-4'>
					<div className='col-8 mb-3 mb-sm-0'>
						<Card stretch className='mt-4' style={{ height: '80vh' }}>
							<CardBody>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										height: '100%',
									}}>
									{/* Scrollable Table Content */}
									<div style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
										<table className='table table-hover table-bordered border-primary'>
											<thead className={'table-dark border-primary'}>
												<tr>
													<th>Name</th>
													<th>U/Price(LKR)</th>

													<th>Selling Amount(LKR)</th>
													<th>Qty</th>
													<th>Discount</th>
													<th>Net Value(LKR)</th>
													<th></th>
												</tr>
											</thead>
											<tbody>
												{orderedItems.map((val: any, index: any) => (
													<tr key={index}>
														<td>
															{val.category} {val.model} {val.brand}
														</td>

														<td className='text-end'>
															{val.sellingPrice.toFixed(2)}
														</td>

														<td>
															<FormGroup
																id='quantity'
																className='col-12'>
																<Input
																	type='number'
																	min={0}
																	onChange={(
																		e: React.ChangeEvent<HTMLInputElement>,
																	) => {
																		let value = e.target.value;
																		if (
																			value.length > 1 &&
																			value.startsWith('0')
																		) {
																			value =
																				value.substring(1);
																		}
																		// console.log(value);
																		handleDiscountChange(
																			val.sellingPrice,
																			index,
																			value,
																			val.quantity,
																		);
																	}}
																	value={val.finalsellingprice}
																	validFeedback='Looks good!'
																/>
															</FormGroup>
														</td>
														<td className='text-end'>{val.quantity}</td>
														<td>{val.discount}</td>
														<td className='text-end'>
															{(
																val.sellingPrice * val.quantity -
																val.discount
															).toFixed(2)}
														</td>
														<td>
															<Button
																icon='delete'
																onClick={() =>
																	handleDeleteItem(val.barcode)
																}></Button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									{/* Fixed Total Row */}
									<div>
										<table className='table table-bordered border-primary'>
											<tbody>
												<tr>
													<td colSpan={4} className='text fw-bold'>
														Total(LKR)
													</td>
													<td className='fw-bold text-end'>
														{calculateSubTotal()}
													</td>{' '}
												</tr>
												<tr>
													<td colSpan={4} className='text fw-bold'>
														Discount(LKR)
													</td>
													<td className='fw-bold text-end'>
														{Number(
															getAllDiscounts() + Number(discount),
														).toFixed(2)}
													</td>{' '}
												</tr>
												{returndata && (
													<tr>
														<td colSpan={4} className='text fw-bold'>
															Return Item Value(LKR)
														</td>
														<td className='fw-bold text-end'>
															{returndata.sold_price.toFixed(2)}
														</td>{' '}
													</tr>
												)}
												<tr style={{ fontSize: '2rem' }}>
													<td colSpan={4} className='text fw-bold'>
														Net Value(LKR)
													</td>
													<td className='fw-bold text-end'>
														{(
															calculateSubTotal() -
															(getAllDiscounts() + Number(discount)) -
															Number(returndata?.sold_price ?? 0)
														).toFixed(2)}
													</td>{' '}
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
					{/* Second Card */}

					<div className='col-4'>
						<Card stretch className='mt-4 p-4' style={{ height: '80vh' }}>
							<CardBody isScrollable>
								{returnstatus ? (
									<FormGroup
										id='return'
										label='Return Id'
										className='col-12 mt-2'>
										<Input
											// ref={quantityRef}
											type='number'
											// onKeyDown={handleaddKeyPress}
											onChange={(e: any) => {
												handlereturn(e.target.value),
													setReturnid(e.target.value);
											}}
											value={returnid}
											min={1}
											validFeedback='Looks good!'
										/>
									</FormGroup>
								) : (
									<div></div>
								)}

								<FormGroup id='product' label='Barcode ID' className='col-12'>
									<Dropdown
										aria-label='State'
										editable
										ref={dropdownRef}
										type='number'
										placeholder='-- Select Product --'
										className='selectpicker col-12'
										options={
											items
												? items.map((type: any) => ({
														value: type.barcode,
														label: type.barcode.slice(-6),
												  }))
												: [{ value: '', label: 'No Data' }]
										}
										onChange={(e: any) => setSelectedProduct(e.target.value)}
										onKeyDown={handleDropdownKeyPress}
										value={selectedProduct}
									/>
								</FormGroup>
								<FormGroup id='quantity' label='Quantity' className='col-12 mt-2'>
									<Input
										ref={quantityRef}
										type='number'
										onKeyDown={handleaddKeyPress}
										onChange={(e: any) => {
											let value = e.target.value;
											if (value.length > 1 && value.startsWith('1')) {
												value = value.substring(1);
											}
											setQuantity(value);
										}}
										value={quantity}
										min={1}
										validFeedback='Looks good!'
									/>
								</FormGroup>

								<Button
									color='success'
									className='mt-4 w-100 '
									ref={addRef}
									onKeyDown={addchange}
									onClick={handlePopupOk}>
									ADD
								</Button>
								<FormGroup id='discount' label='Discount' className='col-12 mt-2'>
									<Input
										ref={discountRef}
										type='number'
										onKeyDown={discountchange}
										onChange={(e: any) => {
											let value = e.target.value;
											if (value.length > 1 && value.startsWith('0')) {
												value = value.substring(1);
											}
											setDiscount(value);
										}}
										value={discount}
										min={1}
										validFeedback='Looks good!'
									/>
								</FormGroup>
								<FormGroup label='Contact Number' className='col-12 mt-3'>
									<Input
										type='number'
										value={contact}
										min={0}
										onChange={(e: any) => {
											const value = e.target.value.slice(0, 9);
											contactchanget(value);
										}}
										validFeedback='Looks good!'
									/>
								</FormGroup>
								<FormGroup label='Customer Name' className='col-12 mt-3'>
									<Input
										ref={nameRef}
										disabled={status}
										type='text'
										value={name}
										min={0}
										onChange={(e: any) => {
											setName(e.target.value);
										}}
										validFeedback='Looks good!'
									/>
								</FormGroup>
							</CardBody>
							<CardFooter>
								<Button
									ref={endRef}
									color='success'
									className='mt-4 w-100 btn-lg'
									style={{ padding: '1rem', fontSize: '1.25rem' }}
									onClick={addbill}
									onKeyDown={salechange}>
									Print
								</Button>
							</CardFooter>
						</Card>
					</div>

					<Card
					hidden
						stretch
						className='mt-4'
						style={{ height: '80vh' }}
						
					>
						<CardBody isScrollable>
							<div
								className='ms-4 ps-3'
								ref={invoiceRef}
								id='invoice'
								style={{
									display: 'flex',
									color: 'black',
								}}>
								<div>
									{chunks.map((chunk, chunkIndex) => (
										<div
											key={chunkIndex}
											style={{
												width: '130mm',
												height: '130mm',
												background: '#fff',
												border: '1px dashed #ccc',
												padding: '20px',
												fontFamily: 'Arial, sans-serif',
												fontSize: '12px',
												position: 'relative', // Enables absolute positioning inside
											}}>
											{/* Header */}
											<div className='text-left '>
												<h1
													style={{
														fontSize: '29px',
														fontFamily: 'initial',
														color: 'black',
													}}>
													Suranga Cell Care
												</h1>
												<p style={{ marginBottom: '2px', color: 'black' }}>
													No. 524/1A, Kandy Road, Kadawatha.
												</p>
												<p style={{ marginBottom: '0', color: 'black' }}>
													Tel: +94 11 292 60 30 | Mobile: +94 76 401 77 28
												</p>
											</div>
											{/* <hr style={{ margin: '0 0 5px 0 ' ,color:"black"}} /> */}
											<span
												style={{
													marginBottom: '1px',
													display: 'block',
													borderTop: '1px solid black',
													color: 'black',
												}}></span>
											{/* Invoice Details */}
											<table
												className='table table-borderless'
												style={{
													marginBottom: '5px',
													lineHeight: '1.2',
												}}>
												<tbody style={{ color: 'black' }}>
													<tr>
														<td
															style={{
																width: '50%',
																color: 'black',
																padding: '2px 0 0 ',
															}}>
															Invoice No : {id}
														</td>
														<td
															style={{
																color: 'black',
																padding: '2px 0',
															}}>
															Invoice Date : {currentDate}
														</td>
													</tr>
													<tr>
														<td
															style={{
																color: 'black',
																padding: '2px 0',
															}}>
															Name:{name || ' --'}
														</td>
														<td
															style={{
																color: 'black',
																padding: '2px 0',
															}}>
															Invoiced Time : {currentTime}
														</td>
													</tr>
												</tbody>
											</table>
											<span
												style={{
													marginBottom: '3px',
													display: 'block',
													borderTop: '1px solid black',
													color: 'black',
												}}></span>
											<p
												style={{
													marginBottom: '0',
													lineHeight: '1.2',
													fontSize: '12px',
													color: 'black',
												}}>
												Description
												&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&emsp;&emsp;&emsp;
												Price &nbsp;&emsp;&nbsp;&nbsp; D/Price&emsp;&emsp; Qty
												&nbsp;&emsp;&emsp; Amount
											</p>
											<span
												style={{
													marginTop: '3px',
													display: 'block',
													borderTop: '1px solid black',
													color: 'black',
												}}></span>
											{chunk.map(
												(
													{
														category,
														model,
														code,
														brand,
														discount,
														quantity,
														sellingPrice,
														warranty,
														storage,
														imi,
													}: any,
													index: number,
												) => (
													// <table className='table table-hover table-bordered border-primary'
													<table
													// border={1}
														key={index}
														style={{
															color: 'black',
															width: '115mm',
															borderCollapse: 'collapse',
															fontSize: '12px',
														}}>
															
															
														<tbody>
															<tr>
																<td
																	style={{
																		color: 'black',
																		width: '44%',
																		padding: '5px',
																	}}>
																	{index + 1}.{" "}{code} {brand} {model}{' '}
																	{category} {storage} {imi} {" "}
																	<label
																		style={{
																			fontSize: '10px',
																		}}>
																		({warranty})
																	</label>
																</td>
																<td
																	style={{
																		color: 'black',
																		width: '15%',
																		textAlign: 'right',
																		padding: '5px',
																		
																	}}>
																	{sellingPrice.toFixed(2)}
																</td>
																<td
																	style={{
																		color: 'black',
																		width: '15%',
																		textAlign: 'right',
																		padding: '5px',
																		
																	}}>
																	{(discount/quantity).toFixed(2)}
																</td>
																<td
																	style={{
																		color: 'black',
																		width: '8%',
																		textAlign: 'right',
																		padding: '5px',
																	}}>
																	{quantity}
																</td>
																<td
																	style={{
																		color: 'black',
																		width: '18%',
																		textAlign: 'right',
																		padding: '5px',
																	}}>
																	{(
																		(sellingPrice * quantity)-discount
																	).toFixed(2)}
																</td>
															</tr>
														</tbody>
													</table>
												),
											)}
											<div
												style={{
													
													position: 'absolute',
													top: '100mm',
													left: '0',
													width: '100%',
													padding: '0 15px',
												}}>
												<span
													className='position-absolute  start-55'
													style={{
														marginTop: '0px',
														display: 'block',
														width: 190,
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												<div
													className='position-relative me-4'
													style={{ color: 'black' }}>
													<div className='position-absolute start-60'>
														Total
													</div>
													<div className='position-absolute top-0 end-5'>
														{calculateSubTotal()-getAllDiscounts()}.00
													</div>
													
												</div>
												<br />
												<span
													className='position-absolute  start-55'
													style={{
														marginTop: '0px',
														display: 'block',
														width: 190,
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												<div
													className='position-relative me-4'
													style={{ color: 'black' }}>
													<div className='position-absolute top-0 start-60'>
														Discount
													</div>
													<div className='position-absolute top-0 end-5'>
														{Number(discount).toFixed(2)}
													</div>
												</div>
												<br />
												<span
													className='position-absolute  start-55'
													style={{
														marginTop: '0px',
														display: 'block',
														width: 190,
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												{returndata && (
													<>
														<div
															className='position-relative me-4'
															style={{ color: 'black' }}>
															<div className='position-absolute start-60'>
																Return Value
															</div>
															<div className='position-absolute top-0 end-5'>
																{Number(returndata?.sold_price ?? 0)}.00
															</div>
														</div>
														<br />
														<span
															className='position-absolute  start-55'
															style={{
																marginTop: '0px',
																display: 'block',
																width: 190,
																borderTop: '1px solid black',
																color: 'black',
															}}></span>
													</>
												)}

												<div
													className='position-relative me-4'
													style={{ color: 'black' }}>
													<div
														className='position-absolute top-0 start-60 fw-bold'
														style={{ fontSize: '14px' }}>
														SUB TOTAL
													</div>
													<div
														className='position-absolute top-0 end-5 fw-bold'
														style={{ fontSize: '14px' }}>
														{(
															calculateSubTotal() -
															(getAllDiscounts() + Number(discount)) -
															Number(returndata?.sold_price ?? 0)
														).toFixed(2)}
													</div>
												</div>
												<br />
												<span
													className='position-absolute  start-55'
													style={{
														marginTop: '0px',
														display: 'block',
														width: 190,
														borderTop: '1px solid black',
														color: 'black',
													}}></span>
												<div
													style={{
														textAlign: 'center',
														fontSize: '12px',
														color: 'black',
														marginTop: '3px',
													}}>
													...........................Thank You ... Come
													Again...........................
												</div>
												<div
													style={{
														textAlign: 'right',
														fontSize: '10px',
														color: 'black',
													}}>
													POS System by EXE.LK +94 70 332 9900
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</CardBody>
					</Card>

					{/* <div className='col-4'>
						<Card stretch className='mt-4 p-4' style={{ height: '80vh' }}>
							<CardBody isScrollable>
								<div
								
									style={{
										width: '300px',
										fontSize: '12px',
										backgroundColor: 'white',
										color: 'black',
									}}
									className='p-3'>
									<center>
										
										<p>
											<b>Suranga Cell Care</b>
											<br />
											No.524/1/A,
											<br />
											Kandy Road,
											<br />
											Kadawatha
											<br />
											TEL : 011 292 6030/ 071 911 1144
										</p>
									</center>
									<div className='d-flex justify-content-between align-items-center mt-4'>
										<div className='text-start'>
											<p className='mb-0'>
												DATE &nbsp;&emsp; &emsp; &emsp;:&emsp;{currentDate}
											</p>
											<p className='mb-0'>
												START TIME&emsp;:&emsp;{currentTime}
											</p>
											<p className='mb-0'>
												{' '}
												INVOICE NO&nbsp; &nbsp;:&emsp;{id}
											</p>
										</div>
									</div>

									<hr />
									<hr />
									<p>
										Product &emsp;Qty&emsp;&emsp; U/Price&emsp;&emsp;&emsp; Net
										Value
									</p>

									<hr />

									{orderedItems.map(
										(
											{
												cid,
												category,
												model,
												brand,
												quantity,
												price,
												discount,
												barcode,
												sellingPrice,
											}: any,
											index: any,
										) => (
											<p>
												{index + 1}. {category} {model} {brand}
												<br />
												{barcode}&emsp;
												{quantity}&emsp;&emsp;&emsp;
												{sellingPrice}.00&emsp;&emsp;&emsp;&emsp;
												{(sellingPrice * quantity).toFixed(2)}
											</p>
										),
									)}

									<hr />

									<div className='d-flex justify-content-between'>
									
									</div>
									<div className='d-flex justify-content-between'>
										<div>
											<strong>Sub Total</strong>
										</div>
										<div>
											<strong>{calculateSubTotal()}</strong>
										</div>
									</div>
									<hr />
									<div className='d-flex justify-content-between'>
										<div>Cash Received</div>
										<div>{amount}.00</div>
									</div>
									<div className='d-flex justify-content-between'>
										<div>Balance</div>
										<div>{amount - Number(calculateSubTotal())}</div>
									</div>
									<div className='d-flex justify-content-between'>
										<div>No.Of Pieces</div>
										<div>{orderedItems.length}</div>
									</div>

									<hr />
									<center>THANK YOU COME AGAIN</center>
									<hr />

									<center style={{ fontSize: '11px' }}></center>
								</div>
							</CardBody>
						</Card>
					</div> */}
				</div>
			</PageWrapper>
		</>
	);
}

export default index;

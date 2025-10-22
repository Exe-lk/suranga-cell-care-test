import React, { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../../layout/SubHeader/SubHeader';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Button from '../../../components/bootstrap/Button';
import Page from '../../../layout/Page/Page';
import Card, { CardBody, CardTitle } from '../../../components/bootstrap/Card';
import ItemAddModal from '../../../components/custom/ItemAddModal';
import ItemEditModal from '../../../components/custom/ItemEditModal';
import StockAddModal from '../../../components/custom/stockAddModalAcces';
import StockOutModal from '../../../components/custom/StockOutModal';
import Dropdown, { DropdownToggle, DropdownMenu } from '../../../components/bootstrap/Dropdown';
import Swal from 'sweetalert2';
import ItemDeleteModal from '../../../components/custom/itemDeleteAcce';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import { toPng, toSvg } from 'html-to-image';
import { DropdownItem } from '../../../components/bootstrap/Dropdown';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUpdateItemAcceMutation } from '../../../redux/slices/itemManagementAcceApiSlice';
import { useGetItemAccesQuery } from '../../../redux/slices/itemManagementAcceApiSlice';
import bill from '../../../assets/img/bill/WhatsApp_Image_2024-09-12_at_12.26.10_50606195-removebg-preview (1).png';
import { set } from 'date-fns';
import MyDefaultHeader from '../../_layout/_headers/CashierHeader';
import { getItemAcceById1 } from '../../../service/itemManagementAcceService';

const Index: NextPage = () => {
	const [itemCode, setItemCode] = useState<string>('');
	const [searchResult, setSearchResult] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, []);

	const handleSearch = async () => {
		if (!itemCode.trim()) {
			await Swal.fire({
				icon: 'warning',
				title: 'Invalid Input',
				text: 'Please enter an item code',
			});
			return;
		}

		setLoading(true);
		setError('');
		setSearchResult(null);

		try {
			const result = await getItemAcceById1(itemCode.trim());
			
			if (result) {
				setSearchResult(result);
				await Swal.fire({
					icon: 'success',
					title: 'Item Found',
					text: `Quantity: ${result.quantity}`,
				});
			} else {
				setError('Item not found');
				await Swal.fire({
					icon: 'error',
					title: 'Not Found',
					text: 'No item found with this code',
				});
			}
		} catch (err) {
			console.error('Error searching item:', err);
			setError('Error searching item');
			await Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'An error occurred while searching',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<span className='h4 mb-0 fw-bold'>Item Quantity Search</span>
				</SubHeaderLeft>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<CardBody isScrollable className='table-responsive'>
								<div className='row g-4'>
									<div className='col-md-8 offset-md-2'>
										<Card>
											<CardBody>
												<CardTitle>Search Item by Code</CardTitle>
												<div className='row g-3'>
													<div className='col-12'>
														<FormGroup id='itemCode' label='Item Code'>
															<Input
																ref={searchInputRef}
																type='text'
																placeholder='Enter item code'
																value={itemCode}
																onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
																	setItemCode(e.target.value)
																}
																onKeyPress={handleKeyPress}
																disabled={loading}
															/>
														</FormGroup>
													</div>
													<div className='col-12'>
														<Button
															color='primary'
															icon={loading ? 'HourglassEmpty' : 'Search'}
															isLight
															className='w-100'
															onClick={handleSearch}
															isDisable={loading}
														>
															{loading ? 'Searching...' : 'Search'}
														</Button>
													</div>
												</div>

												{searchResult && (
													<div className='mt-4'>
														<div className='alert alert-success'>
															<h5 className='alert-heading'>Item Details</h5>
															<hr />
															<div className='row g-2'>
																<div className='col-md-6'>
																	<strong>Code:</strong> {searchResult.code}
																</div>
																<div className='col-md-6'>
																	<strong>Category:</strong> {searchResult.category || 'N/A'}
																</div>
																<div className='col-md-6'>
																	<strong>Brand:</strong> {searchResult.brand || 'N/A'}
																</div>
																<div className='col-md-6'>
																	<strong>Model:</strong> {searchResult.model || 'N/A'}
																</div>
																<div className='col-12 mt-3'>
																	<div className='text-center p-3 bg-light rounded'>
																		<h3 className='mb-0'>
																			<strong>Quantity: </strong>
																			<span className='text-primary'>
																				{searchResult.quantity}
																			</span>
																		</h3>
																	</div>
																</div>
																{searchResult.sellingPrice && (
																	<div className='col-md-6 mt-2'>
																		<strong>Selling Price:</strong> Rs.{' '}
																		{searchResult.sellingPrice}
																	</div>
																)}
																{searchResult.warranty && (
																	<div className='col-md-6 mt-2'>
																		<strong>Warranty:</strong> {searchResult.warranty}
																	</div>
																)}
															</div>
														</div>
													</div>
												)}

												{error && (
													<div className='mt-4'>
														<div className='alert alert-danger'>{error}</div>
													</div>
												)}
											</CardBody>
										</Card>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default Index;

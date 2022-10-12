import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { noop } from 'rxjs';

import {
  BOTTOM_SHEET_CONFIG,
  debounce,
  downloadDataWithUrl,
  INFINITE_SCROLL_CONFIG,
  ORDER_LISTING_TAB_LIST,
  DATE_OPTIONS,
  ALL_STATUSES,
  downloadPdf,
} from 'src/app/shared/constants/constants';
import { ShipmentsService } from 'src/app/shipments/services/shipments.service';
import { OrdersService } from '../../service/orders.service';
import {
  setFooterState,
  setHeaderState,
} from 'src/app/store/auth/auth.actions';
import { AppState } from 'src/app/store/store.reducer';
import { KycFlowService } from 'src/app/kyc-flow/services/kyc-flow.service';
import { IsSelfieEnableResponse } from 'src/app/kyc-flow/models/IsSelfieEnableResponse';
import { FiltersBottomSheetComponent } from '../../components/filters-bottom-sheet/filters-bottom-sheet.component';
import { loadProfileDetails } from 'src/app/store/profile/profile.actions';
import { loadWalletDetails } from 'src/app/store/wallet/wallet.actions';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

@Component({
  selector: 'app-orders-listing-container',
  templateUrl: './orders-listing-container.component.html',
  styleUrls: ['./orders-listing-container.component.scss'],
})
export class OrdersListingContainerComponent implements OnInit, OnDestroy {
  activeTabIndex: number = 0;
  orderList: any = [];
  searchedOrderList: any = [];
  isOrderListEmpty: boolean = false;
  tabList: any = ORDER_LISTING_TAB_LIST;
  selectedOrderIds: any[] = [];
  selectedShipmentIds: any[] = [];
  selectedOrderItems: any = {};
  isKycEnabled: boolean = false;
  isSearchBarOpen: boolean = false;
  searchText: string = '';
  filterData: any = {
    dateOptionsList: DATE_OPTIONS,
  };
  filterValues: any = {
    payment_method: '',
    channel_id: '',
    courier_id: '',
    filter: '',
    order_status: '',
    from: '',
    to: '',
    type: '',
    dateTypeIndex: 4,
  };

  @ViewChild('longPressDiv') longPressDiv!: ElementRef;

  page: number = 1;
  perPage: number = 15;
  INFINITE_SCROLL_CONFIG: any = INFINITE_SCROLL_CONFIG;
  isInfiniteScrollDisabled: boolean = false;

  isLongPressed: any = false;

  constructor(
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    private orderService: OrdersService,
    private shipmentsService: ShipmentsService,
    private toastr: ToastrService,
    private store: Store<AppState>,
    private kycFlowService: KycFlowService,
    private _bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
    private ga: GoogleAnalyticsService
  ) {
    this.store.dispatch(setFooterState({ value: true }));
    this.store.dispatch(setHeaderState({ value: true }));
    const user = JSON.parse(localStorage.getItem('USER') as string);
    this.ga.companyId = user.company_id;
    this.route.queryParams.subscribe((params) => {
      this.filterValues = {
        ...this.filterValues,
        ...params,
      };
      if (!this.filterValues.type) {
        this.filterValues.type = this.tabList[0].name;
      }
      if (this.filterValues.type == this.tabList[0].name) {
        this.activeTabIndex = 0;
      } else if (this.filterValues.type == this.tabList[1].name) {
        this.activeTabIndex = 1;
      }else if(this.filterValues.type == this.tabList[2].name) {
        this.activeTabIndex = 2;
      }
      if (
        this.filterValues.dateTypeIndex &&
        this.filterValues.dateTypeIndex != DATE_OPTIONS.length - 1
      ) {
        this.filterValues['from'] =
          DATE_OPTIONS[this.filterValues.dateTypeIndex].from;
        this.filterValues['to'] =
          DATE_OPTIONS[this.filterValues.dateTypeIndex].to;
      }
    });
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  ngOnInit(): void {
    this.ga.pageName = 'Orders Page';
    this.ga.tabName = this.tabList[this.activeTabIndex].name;
    this.ga.eventEmitter('Orders page view', 'Order Listing', ['tab_name']);
    this.store.select('profile').subscribe((data) => {
      if (
        !Object.keys(data.profileDetails).length &&
        localStorage.getItem('AUTH_TOKEN')
      ) {
        const body = {
          token: localStorage.getItem('AUTH_TOKEN'),
          is_web: 1,
        };
        this.store.dispatch(loadProfileDetails({ body }));
      }
    });

    this.store.select('wallet').subscribe((data) => {
      if (
        !Object.keys(data.walletDetails).length &&
        localStorage.getItem('AUTH_TOKEN')
      ) {
        this.store.dispatch(loadWalletDetails());
      }
    });
    this.getFilterData();
    this.kycFlowService
      .callIsSelfieEnable()
      .subscribe((resp: IsSelfieEnableResponse) => {
        this.isKycEnabled =
          [2, 5, 6, 7].indexOf(resp.kyc_saved_details[1].status) === -1 &&
          [2, 5, 6, 7].indexOf(resp.kyc_saved_details[2].status) === -1;
      });
    localStorage.removeItem('ORDER_DETAILS');
    localStorage.removeItem('COURIER_DETAILS');
    // const isAllOrder = this.filterValues.type == this.tabList[1].name;
    this.handleGetOrderList(this.filterValues.type);
  }

  getFilterData() {
    let apiUrl = 'orders/processingordersfilters';
    const isAllOrderTab = this.activeTabIndex == this.tabList[2].index;
    const isReadyToShipTab = this.activeTabIndex == this.tabList[1].index;
    
    if (isAllOrderTab || isReadyToShipTab) {
      apiUrl = 'orders/manifestfilters';
    }
    this.orderService.getFiltersData(apiUrl).subscribe((res) => {
      if (isAllOrderTab) {
        this.filterData = {
          ...this.filterData,
          channelOptionsList: res['channels'],
          orderStatusOptionsList: ALL_STATUSES,
          paymentTypeOptionsList: res['paymentTypes'],
          courierOptionsList: res['shippingPartners'],
        };
      } else if(isReadyToShipTab){
        this.filterData = {
          ...this.filterData,
          channelOptionsList: res['channels'],
          orderStatusOptionsList: res['statuses'],
          paymentTypeOptionsList: res['paymentTypes'],
          courierOptionsList: res['shippingPartners'],
        };
      } else {
        this.filterData = {
          ...this.filterData,
          channelOptionsList: res['channels'],
          orderStatusOptionsList: res['statuses'],
          paymentTypeOptionsList: res['paymentTypes'],
        };
      }
    }, noop);
  }

  onTabChange(index: any) {
    if (this.activeTabIndex !== index) {
      this.activeTabIndex = index;
      this.filterValues = {
        type: this.tabList[index].name,
      };

      this.router.navigate(['/orders/list'], {
        queryParams: this.filterValues,
      });
    }
  }

  handleGetOrderList(activeTabName: string) {
    this.ngxLoader.start('orderList');
    this.isOrderListEmpty = false;
    const body = {
      page: this.page,
      per_page: this.perPage,
      search: this.searchText,
      ...this.filterValues,
    };
    delete body['type'];
    delete body['dateTypeIndex'];
    this.orderService.getOrdersList(body, activeTabName).subscribe(
      (res: any) => {
        this.orderList = [...this.orderList, ...res.data];
        if (this.searchText) {
          this.searchedOrderList = res.data;
        } else {
          this.searchedOrderList = this.orderList;
        }
        if (this.page == 1 && this.searchedOrderList.length == 0) {
          this.isOrderListEmpty = true;
        }
        if (!res.data.length || res.data.length < this.perPage) {
          this.isInfiniteScrollDisabled = true;
        }
        this.ngxLoader.stop('orderList');
      },
      (error) => {
        if (error?.error?.message) {
          this.toastr.error(error.error.message);
        }
        this.ngxLoader.stop('orderList');
      }
    );
  }

  onOrderListScrollDown() {
    this.page = this.page + 1;
    // const isAllOrder = this.tabList[1].index == this.activeTabIndex;
    this.handleGetOrderList(this.filterValues.type);
  }

  navigateToOrderDetails(event: any, orderItem: any) {
    if (this.selectedOrderIds.length) {
      this.onLongPress(orderItem);
      return;
    }

    if (event?.target?.id != orderItem.id) {
      this.ga.orderId = orderItem.id;
      this.ga.eventEmitter('Clicked on Order card', 'Order Listing', ['tab_name', 'order_id']);
      this.router.navigateByUrl(`orders/${orderItem.id}/detail`);
    }
  }

  onLongPress(orderItem: any) {
    if (this.isSearchBarOpen) {
      return;
    }
    if (this.isSelectedOrder(orderItem.id)) {
      const index = this.selectedOrderIds.indexOf(orderItem.id);
      if (index > -1) {
        this.selectedOrderIds.splice(index, 1);
        delete this.selectedOrderItems[orderItem.id];
      }
    } else {
      this.selectedOrderIds.push(orderItem.id);
      this.selectedOrderItems[orderItem.id] = orderItem;
    }
    if (this.selectedOrderIds.length) {
      // this.store.dispatch(setHeaderState({ value: true }));
      this.store.dispatch(setFooterState({ value: false }));
    } else {
      this.store.dispatch(setHeaderState({ value: true }));
      this.store.dispatch(setFooterState({ value: true }));
    }
  }

  setHeaderState(value: boolean) {
    this.store.dispatch(setHeaderState({ value: value }));
  }

  setFooterState(value: boolean) {
    this.store.dispatch(setFooterState({ value: value }));
  }

  onLongPressing() {}

  handleSelectAll() {
    this.selectedOrderIds = [];
    for (let orderItem of this.searchedOrderList) {
      this.selectedOrderIds.push(orderItem.id);
      this.selectedOrderItems[orderItem.id] = orderItem;
    }
  }

  isSelectedOrder(id: any) {
    return this.selectedOrderIds.includes(id);
  }

  clearSelectedOrderIdList() {
    this.selectedOrderIds.length = 0;
    this.selectedOrderItems = {};
    this.setHeaderState(true);
    this.setFooterState(true);
  }

  handleDownloadMultipleInvoices(id: any = '') {
    this.ngxLoader.start('downloadInvoice');
    const body: any = {};
    if (id) {
      body['ids'] = [id];
    } else {
      body['ids'] = this.selectedOrderIds;
    }
    this.shipmentsService.downloadInvoice(body).subscribe(
      (res) => {
        if (res.invoice_url) {
          downloadDataWithUrl(res.invoice_url, 'Invoice');
          this.toastr.success('Invoice downloaded successfully');
          this.clearSelectedOrderIdList();
        } else {
          this.toastr.success(res.message);
        }
        this.ngxLoader.stop('downloadInvoice');
      },
      (error) => {
        this.ngxLoader.stop('downloadInvoice');
        if (error?.error?.message) {
          this.toastr.error(error.error.message);
        }
      }
    );
  }

  getSelectedShipmentIdsList() {
    let shipmentIdList: any = [];

    let that = this;

    if (!this.selectedOrderIds.length) {
      return shipmentIdList;
    }

    for (let orderId of this.selectedOrderIds) {
      if (that.selectedOrderItems[orderId]?.shipment_id) {
        shipmentIdList.push(that.selectedOrderItems[orderId].shipment_id);
      }
    }

    return shipmentIdList;
  }

  handleDownloadMultipleLabels(id: any = '') {
    this.ngxLoader.start('downloadLabel');
    
    const body: any = {};
    if (id) {
      body['shipment_id'] = [id];
    } else {
      body['shipment_id'] = this.getSelectedShipmentIdsList();
    }

    body['is_web'] = 1;

    this.shipmentsService.downloadLabel(body).subscribe(
      (res) => {
        if (res.name) {
          downloadPdf(res.data, res.name);
          this.toastr.success('Label downloaded successfully');
        } else if (res.label_created) {
          downloadDataWithUrl(res.label_url, 'label');
          this.toastr.success('Label downloaded successfully');
        } else {
          if (res.response) {
            this.toastr.error(res.response);
          }
        }
        this.ngxLoader.stop('downloadLabel');
      },
      (error) => {
        this.ngxLoader.stop('downloadLabel');
        if (error?.error?.message) {
          this.toastr.error(error.error.message);
        }
      }
    );
  }

  handleCancelMultipleOrder(id: any = '') {
    this.ngxLoader.start('cancelOrder');
    const body: any = {
      cancel_on_channel: 1,
      is_return: 0,
    };
    const url = 'orders/cancel';
    if (id) {
      body['ids'] = [id];
      body['order_ids'] = [id];
    } else {
      body['ids'] = this.selectedOrderIds;
      body['order_ids'] = this.selectedOrderIds;
    }
    this.shipmentsService.cancelOrder(url, body).subscribe(
      (res) => {
        if (res?.message) {
          this.toastr.success(res?.message);
          window.location.reload();
        }
        this.ngxLoader.stop('cancelOrder');
      },
      (error) => {
        this.ngxLoader.stop('cancelOrder');
        if (error?.error?.message) {
          this.toastr.error(error.error.message);
        }
      }
    );
  }

  handleClickSearch() {
    this.ga.eventEmitter('Clicked on Search Icon', 'All', ['page_name']);
    this.isSearchBarOpen = true;
    this.clearSelectedOrderIdList();
    this.setHeaderState(false);
    this.setFooterState(false);
    setTimeout( () =>
    (<HTMLInputElement>document.getElementById('searchInput')).focus()
    ,0);
  }

  handleClickSearchClose() {
    this.isSearchBarOpen = false;
    this.clearSelectedOrderIdList();
    this.setHeaderState(true);
    this.setFooterState(true);
    this.searchText = '';
    this.searchedOrderList = [...this.orderList];
  }

  handleSearch = debounce(() => {
    this.page = 1;
    this.searchedOrderList = [];
    // const isAllOrderTab = this.activeTabIndex == this.tabList[1].index;
    this.handleGetOrderList(this.filterValues.type);
  }, 500);

  openFiltersBottomSheet() {
    this.ga.eventEmitter('Clicked on Filters', 'All', ['page_name']);
    const isAllOrderTab = this.activeTabIndex == this.tabList[2].index;
    if (isAllOrderTab) {
    } else {
      this.filterValues['filter'] = this.filterValues['order_status'];
    }
    if (
      this.filterValues.dateTypeIndex &&
      this.filterValues.dateTypeIndex != DATE_OPTIONS.length - 1
    ) {
      this.filterValues['from'] =
        DATE_OPTIONS[this.filterValues.dateTypeIndex].from;
      this.filterValues['to'] =
        DATE_OPTIONS[this.filterValues.dateTypeIndex].to;
    }
    const data = {
      ...BOTTOM_SHEET_CONFIG,
      data: {
        filterData: this.filterData,
        filterValues: this.filterValues,
        isAllOrderTab: this.activeTabIndex == this.tabList[2].index,
      },
    };
    const bottomSheetRef = this._bottomSheet.open(
      FiltersBottomSheetComponent,
      data
    );
    bottomSheetRef.afterDismissed().subscribe((dataFromBottomSheet) => {
      if (dataFromBottomSheet) {
        this.filterValues = dataFromBottomSheet;
        if (isAllOrderTab) {
          delete this.filterValues['channel_id'];
          delete this.filterValues['order_status'];
          this.filterValues['filter_by'] = 'status';
        } else {
          this.filterValues['order_status'] = this.filterValues['filter'];
          delete this.filterValues['courier_id'];
          delete this.filterValues['filter'];
        }
        this.router.navigate(['/orders/list'], {
          queryParams: this.filterValues,
        });
      }
    });
  }

  ngOnDestroy() {
    this.store.dispatch(setHeaderState({ value: false }));
    this.store.dispatch(setFooterState({ value: false }));
  }
}

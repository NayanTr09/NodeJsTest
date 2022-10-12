import { createFeatureSelector, createSelector } from '@ngrx/store';
import { KycFlowState } from './kyc-flow.reducer';

export const featureKey = 'kycFlow';
export const selectFeature = createFeatureSelector<KycFlowState>(featureKey);
 
export const selectKycFlowState = createSelector(
  selectFeature,
  (state: KycFlowState) => state
);

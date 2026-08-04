import React from 'react';
import ContentCard from '../../../components/ContentCard';
import SupplierForm from './SupplierForm';

function InsertView({ onSessionExpired }) {
  return (
    <ContentCard title="Insert Supplier">
      <SupplierForm onSessionExpired={onSessionExpired} />
    </ContentCard>
  );
}

export default InsertView;

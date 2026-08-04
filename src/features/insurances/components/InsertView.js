import React from 'react';
import ContentCard from '../../../components/ContentCard';
import InsuranceForm from './InsuranceForm';

function InsertView({ onSessionExpired }) {
  return (
    <ContentCard title="Insert Insurance">
      <InsuranceForm onSessionExpired={onSessionExpired} />
    </ContentCard>
  );
}

export default InsertView;

import React from 'react';
import ContentCard from '../../../components/ContentCard';
import PolicyForm from './PolicyForm';

function InsertView({ onSessionExpired }) {
  return (
    <ContentCard title="Insert Policy">
      <PolicyForm onSessionExpired={onSessionExpired} />
    </ContentCard>
  );
}

export default InsertView;

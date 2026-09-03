import React from 'react';
import { ConfirmationModal, ConfirmationModalProps } from './ConfirmationModal';

export type DeleteConfirmationModalProps = ConfirmationModalProps;

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = (props) => {
  return <ConfirmationModal variant="danger" {...props} />;
};

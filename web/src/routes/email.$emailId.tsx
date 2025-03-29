import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router'
import EmailDetails from '../components/EmailDetails';

export const Route = createFileRoute('/email/$emailId')({
  component: EmailDetails,
})

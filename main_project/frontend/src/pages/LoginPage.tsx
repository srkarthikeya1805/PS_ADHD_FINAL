import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CenteredLogin } from '../components/auth/CenteredLogin';
import { useIntro } from '../App';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIntroPhase } = useIntro();

  return (
    <CenteredLogin
      onSuccess={() => {
        setIntroPhase('intro');
        navigate('/dashboard');
      }}
    />
  );
};

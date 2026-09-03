import { render, screen } from '@testing-library/react';
import LivePage from './LivePage';
import { LanguageProvider } from '../context/LanguageContext';

jest.mock('../components/Main/Live/LiveWorkspace', () => () => <div data-testid="live-workspace" />);

test('renders the live workspace', () => {
  // No MemoryRouter: LivePage renders no router-aware children, and
  // react-router v7 does not resolve under CRA's jest 27 (package exports).
  render(
    <LanguageProvider>
      <LivePage />
    </LanguageProvider>
  );

  expect(screen.getByTestId('live-workspace')).toBeInTheDocument();
});

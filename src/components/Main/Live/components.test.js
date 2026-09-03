import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../context/LanguageContext';
import ModeTabs from './ModeTabs';
import LanguagePairBar from './LanguagePairBar';
import TwoWayToggle from './TwoWayToggle';
import MicButton from './MicButton';
import TranscriptStream from './TranscriptStream';

const wrap = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

test('ModeTabs disables everything except translate', () => {
  const onChange = jest.fn();
  wrap(<ModeTabs mode="translate" onChange={onChange} />);

  expect(screen.getByRole('button', { name: /translate/i })).toBeEnabled();
  expect(screen.getByRole('button', { name: /transcribe/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /dubbing/i })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: /transcribe/i }));
  expect(onChange).not.toHaveBeenCalled();
});

test('LanguagePairBar shows both languages and swaps them', () => {
  const onSwap = jest.fn();
  wrap(<LanguagePairBar langA="English" langB="Thai" onPickA={jest.fn()} onPickB={jest.fn()} onSwap={onSwap} disabled={false} />);

  expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thai' })).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/swap/i));
  expect(onSwap).toHaveBeenCalled();
});

test('LanguagePairBar locks while a session is running', () => {
  wrap(<LanguagePairBar langA="English" langB="Thai" onPickA={jest.fn()} onPickB={jest.fn()} onSwap={jest.fn()} disabled />);
  expect(screen.getByRole('button', { name: 'English' })).toBeDisabled();
});

test('TwoWayToggle reports the flipped value', () => {
  const onChange = jest.fn();
  wrap(<TwoWayToggle enabled={false} onChange={onChange} infoText="info" disabled={false} />);

  fireEvent.click(screen.getByRole('switch'));
  expect(onChange).toHaveBeenCalledWith(true);
});

test('MicButton renders its label and fires on click', () => {
  const onClick = jest.fn();
  wrap(<MicButton state="idle" label="Press and start talking" onClick={onClick} disabled={false} />);

  expect(screen.getByText('Press and start talking')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});

test('MicButton exposes its listening state to assistive tech', () => {
  wrap(<MicButton state="listening" label="Listening…" onClick={jest.fn()} disabled={false} />);
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
});

test('TranscriptStream shows the empty state', () => {
  wrap(<TranscriptStream utterances={[]} interimText="" onRetry={jest.fn()} emptyLabel="Nothing yet" />);
  expect(screen.getByText('Nothing yet')).toBeInTheDocument();
});

test('TranscriptStream renders source and translation', () => {
  const utterances = [
    { id: '1', sourceText: 'สวัสดี', sourceLang: 'Thai', translatedText: 'Hello', targetLang: 'English', status: 'done' },
  ];
  wrap(<TranscriptStream utterances={utterances} interimText="" onRetry={jest.fn()} emptyLabel="Nothing yet" />);

  expect(screen.getByText('สวัสดี')).toBeInTheDocument();
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(screen.queryByText('Nothing yet')).not.toBeInTheDocument();
});

test('TranscriptStream shows interim text separately from settled utterances', () => {
  wrap(<TranscriptStream utterances={[]} interimText="สวัส" onRetry={jest.fn()} emptyLabel="Nothing yet" />);
  expect(screen.getByTestId('interim-text')).toHaveTextContent('สวัส');
});

test('TranscriptStream offers a retry on a failed utterance', () => {
  const onRetry = jest.fn();
  const utterances = [
    { id: '7', sourceText: 'Hello', sourceLang: 'English', translatedText: '', targetLang: 'Thai', status: 'failed' },
  ];
  wrap(<TranscriptStream utterances={utterances} interimText="" onRetry={onRetry} emptyLabel="Nothing yet" />);

  fireEvent.click(screen.getByRole('button', { name: /retry|ลองใหม่/i }));
  expect(onRetry).toHaveBeenCalledWith('7');
});

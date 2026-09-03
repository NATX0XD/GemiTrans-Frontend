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

test('ModeTabs reports the mode the user picked', () => {
  const onChange = jest.fn();
  wrap(<ModeTabs mode="transcribe" onChange={onChange} />);

  fireEvent.click(screen.getByRole('button', { name: /translate|แปลภาษา/i }));
  expect(onChange).toHaveBeenCalledWith('translate');
});

test('LanguagePairBar shows both languages and swaps them', () => {
  const onSwap = jest.fn();
  wrap(<LanguagePairBar langA="English" langB="Thai" onPickA={jest.fn()} onPickB={jest.fn()} onSwap={onSwap} disabled={false} />);

  expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thai' })).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/swap|สลับภาษา/i));
  expect(onSwap).toHaveBeenCalled();
});

test('LanguagePairBar opens the picker for whichever side was tapped', () => {
  const onPickA = jest.fn();
  const onPickB = jest.fn();
  wrap(<LanguagePairBar langA="English" langB="Thai" onPickA={onPickA} onPickB={onPickB} onSwap={jest.fn()} disabled={false} />);

  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(onPickA).toHaveBeenCalled();
  expect(onPickB).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Thai' }));
  expect(onPickB).toHaveBeenCalled();
});

test('LanguagePairBar locks while a session is running', () => {
  wrap(<LanguagePairBar langA="English" langB="Thai" onPickA={jest.fn()} onPickB={jest.fn()} onSwap={jest.fn()} disabled />);
  expect(screen.getByRole('button', { name: 'English' })).toBeDisabled();
});

// Every role query below is name-scoped on purpose: a bare getByRole('switch')
// still passes against a control with no accessible name, which is exactly the
// attribute LiveWorkspace's tests rely on to tell the three switches apart.
test('TwoWayToggle reports the flipped value', () => {
  const onChange = jest.fn();
  wrap(<TwoWayToggle enabled={false} onChange={onChange} infoText="info" disabled={false} />);

  fireEvent.click(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }));
  expect(onChange).toHaveBeenCalledWith(true);
});

test('TwoWayToggle reflects its state to assistive tech', () => {
  wrap(<TwoWayToggle enabled onChange={jest.fn()} infoText="info" disabled={false} />);
  expect(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }))
    .toHaveAttribute('aria-checked', 'true');
});

test('TwoWayToggle shows the info text on screen once enabled, not just on hover', () => {
  const info = 'Browser mode cannot detect the language on its own.';
  const { rerender } = wrap(<TwoWayToggle enabled={false} onChange={jest.fn()} infoText={info} disabled={false} />);
  expect(screen.queryByText(info)).not.toBeInTheDocument();

  rerender(
    <LanguageProvider>
      <TwoWayToggle enabled onChange={jest.fn()} infoText={info} disabled={false} />
    </LanguageProvider>
  );
  expect(screen.getByText(info)).toBeInTheDocument();
});

test('MicButton renders its label and fires on click', () => {
  const onClick = jest.fn();
  wrap(<MicButton state="idle" label="Press and start talking" onClick={onClick} disabled={false} />);

  expect(screen.getByText('Press and start talking')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Press and start talking' }));
  expect(onClick).toHaveBeenCalled();
});

test('MicButton exposes its listening state to assistive tech', () => {
  wrap(<MicButton state="listening" label="Listening…" onClick={jest.fn()} disabled={false} />);
  expect(screen.getByRole('button', { name: 'Listening…' })).toHaveAttribute('aria-pressed', 'true');
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

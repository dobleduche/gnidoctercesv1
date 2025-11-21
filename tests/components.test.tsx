import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component test
describe('React Component Tests', () => {
  it('should render a basic component', () => {
    const TestComponent = () => <div>Hello World</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('should handle props correctly', () => {
    const TestComponent = ({ text }: { text: string }) => <div>{text}</div>;
    render(<TestComponent text="Test Message" />);
    expect(screen.getByText('Test Message')).toBeDefined();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FoodTab from './FoodTab';

// Mock the global fetch
global.fetch = vi.fn();

describe('FoodTab Component', () => {
  it('shows loading state initially if no menu', () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: { items: [], grouped: { mains: [], snacks: [], drinks: [] } } })
    });
    render(<FoodTab />);
    expect(screen.getByText(/loading menu/i)).toBeDefined();
  });

  it('renders menu after fetch', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        data: {
          items: [{ id: 1, name: 'Stadium Burger', price: 15, dietary: [] }],
          grouped: { mains: [{ id: 1, name: 'Stadium Burger', price: 15, dietary: [] }], snacks: [], drinks: [] }
        }
      })
    });
    
    render(<FoodTab />);
    
    await waitFor(() => {
      expect(screen.getByText('Stadium Burger')).toBeDefined();
    });
  });
});

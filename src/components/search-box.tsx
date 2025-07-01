'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useMCPStore } from '@/store/mcp-store';
import { Button } from '@/components/ui/button';

export function SearchBox() {
  const { searchQuery, setSearchQuery } = useMCPStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // 300ms 디바운스
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [localQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="서버 이름, 태그, 설명으로 검색..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>
      
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-muted-foreground">
          "{searchQuery}"에 대한 검색 결과
        </div>
      )}
    </div>
  );
} 
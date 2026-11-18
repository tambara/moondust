import { useState } from "react";
import { Input } from "react-aria-components";
import { Autocomplete, useFilter } from "react-aria-components/Autocomplete";
import { Button } from "~/components/area/button";
import { Menu, MenuItem, MenuTrigger } from "~/components/area/Menu";
import { SearchField } from "~/components/area/SearchField";
type PathInputProps<T> = {
    items: readonly T[];

    selectedItems: readonly T[];
    onSelectedItemsChange: (items: T[]) => void;

    getKey: (item: T) => string;
    getLabel: (item: T) => string;

    value: string;
    onValueChange: (value: string) => void;

    segmentsName: string;
    name: string;
    id?: string;
    placeholder?: string;
    required?: boolean;
};

export function RouteInput<T,>({
    items,
    selectedItems,
    onSelectedItemsChange,
    getKey,
    getLabel,
    value,
    onValueChange,
    segmentsName,
    name,
    id,
    placeholder,
    required,
}: PathInputProps<T>) {
    const { contains } = useFilter({ sensitivity: 'base' });

    const addItem = (item: T) => {
        if (selectedItems.some(
            selected => getKey(selected) === getKey(item)
        )) return;

        onSelectedItemsChange([...selectedItems, item]);
    };

    return (
        <>
            <div className="flex gap-3 items-center">
                <span>/</span>

                {selectedItems.map(item => (
                    <span key={getKey(item)}>
                        {getLabel(item)} /
                    </span>
                ))}

                {selectedItems.map((item, index) => (
                    <input
                        key={getKey(item)}
                        type="hidden"
                        name={`${segmentsName}[${index}]`}
                        value={getKey(item)}
                    />
                ))}

                <MenuTrigger>
                    <Button>+</Button>

                    <div className="flex flex-col" style={{ maxHeight: 'inherit' }}>
                        <Autocomplete filter={contains}>
                            <SearchField
                                aria-label="Search"
                                placeholder="Search"
                                autoFocus
                                style={{ margin: 4 }}
                            />

                            <Menu style={{ flex: 1 }}>
                                {items.map(item => (
                                    <MenuItem
                                        key={getKey(item)}
                                        onAction={() => addItem(item)}
                                    >
                                        {getLabel(item)}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Autocomplete>
                    </div>
                </MenuTrigger>

                <span>{value}</span>
            </div>

            <Input
                id={id}
                name={name}
                value={value}
                onChange={e => onValueChange(e.target.value)}
                placeholder={placeholder}
                required={required}
            />
        </>
    );
}
// import { Control } from 'react-hook-form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function CustomFormField({ name, defaultValue }) {
	return (
		<FormField
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel className='capitalize'>{name}</FormLabel>
					<FormControl>
						<Input
							{...field}
							defaultValue={defaultValue}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export function CustomFormSelect({ name, items, labelText }) {
	return (
		<FormField
			name={name}
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel className='capitalize'>{labelText || name}</FormLabel>
						<Select
							onValueChange={field.onChange}
							defaultValue={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{items.map((item) => {
									return (
										<SelectItem
											key={item}
											value={item}>
											{item}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
						<FormMessage />
					</FormItem>
				);
			}}></FormField>
	);
}

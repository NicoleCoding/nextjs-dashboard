'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const formSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = formSchema.omit({ id: true, date: true });
const UpdateInvoice = formSchema.omit({ id: true, date: true });

export async function createInvoice(formdata: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formdata.get('customerId'),
        amount: formdata.get('amount'),
        status: formdata.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql `
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    }
    catch (error) {
        return {
            message: 'Database Error: Failed to create Invoice.',
        };

    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formdata: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formdata.get('customerId'),
        amount: formdata.get('amount'),
        status: formdata.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql `
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id} 
    `;
    }
    catch (error) {
        return {
            message: 'Database Error: Failed to update Invoice.',
        };
    }
    

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

export async function deleteInvoice(id: string) {

    try {
        await sql `
        DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return 'Deleted invoice';
    }
    catch (error) {
        return {
            message: 'Database Error: Failed to delete invoice.',
        };
    }

}
'use server';

export async function createInvoice(formdata: FormData) {
    const rawFormData = {
        customerId: formdata.get('customerId'),
        amount: formdata.get('amount'),
        status: formdata.get('status'),
    };

    console.log(rawFormData);
}
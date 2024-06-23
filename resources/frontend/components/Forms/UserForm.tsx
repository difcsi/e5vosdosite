import { useFormik } from 'formik'
import * as Yup from 'yup'

import { CRUDForm } from 'types/misc'
import { EJGClass } from 'types/models'

import Locale from 'lib/locale'

import Button from 'components/UIKit/Button'
import Form from 'components/UIKit/Form'
import { UserFormValues } from 'components/User/CRUD'

const locale = Locale({
    hu: {
        submit: 'Létrehozás',
        fields: {
            name: 'Név',
            email: 'Email',
            img_url: 'Profilkép',
            e5code: 'E5 kód',
            ejg_class: 'Osztály',
        },
    },
    en: {
        submit: 'Create',
        fields: {
            name: 'Name',
            email: 'Email',
            img_url: 'Profile picture',
            e5code: 'E5 code',
            ejg_class: 'Class',
        },
    },
})

const UserForm = ({
    initialValues,
    onSubmit,
    submitLabel = locale.submit,
    enableReinitialize = false,
    resetOnSubmit = false,
    ...rest
}: CRUDForm<UserFormValues>) => {
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object({}),
        onSubmit: (values) => {
            const val = onSubmit({
                name: values.name,
                email: values.email,
                img_url: values.img_url,
                e5code: values.e5code,
                ejg_class: values.ejg_class,
            })
            if (resetOnSubmit) formik.resetForm()
            return val
        },
        enableReinitialize: enableReinitialize,
    })
    return (
        <Form onSubmit={formik.handleSubmit}>
            <Form.Group>
                <Form.Label>{locale.fields.name}</Form.Label>
                <Form.Control />
            </Form.Group>
            <Form.Group>
                <Form.Label>{locale.fields.email}</Form.Label>
                <Form.Control />
            </Form.Group>
            <Form.Group>
                <Form.Label>{locale.fields.img_url}</Form.Label>
                <Form.Control />
            </Form.Group>
            <Form.Group>
                <Form.Label>{locale.fields.e5code}</Form.Label>
                <Form.Control />
            </Form.Group>
            <Form.Group>
                <Form.Label>{locale.fields.ejg_class}</Form.Label>
                <Form.Select>
                    {Object.entries(EJGClass).map((k, v) => (
                        <option key={v} value={v}>
                            {v}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Button>{submitLabel}</Button>
            </Form.Group>
        </Form>
    )
}

export default UserForm

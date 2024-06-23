import { Permission, Slot, User, UserStub } from 'types/models'

import routeSwitcher from 'lib/route'

import baseAPI from '.'

export const adminAPI = baseAPI
    .enhanceEndpoints({
        addTagTypes: ['Event', 'Slot', 'EventParticipants'],
    })
    .injectEndpoints({
        endpoints: (builder) => ({
            getUsers: builder.query<UserStub[], void>({
                query: () => routeSwitcher('users.index'),
            }),
            getFreeUsers: builder.query<UserStub[], Pick<Slot, 'id'>>({
                query: (slot) =>
                    routeSwitcher('slot.free_students', { slotId: slot }),
            }),
            getNotPresentUsers: builder.query<UserStub[], Pick<Slot, 'id'>>({
                query: (slot) =>
                    routeSwitcher('slot.not_attending_students', {
                        slotId: slot,
                    }),
            }),
            getPresentUsers: builder.query<UserStub[], Pick<User, 'id'>>({
                query: (slot) =>
                    routeSwitcher('slot.attending_students', { slotId: slot }),
            }),

            createSlot: builder.mutation<
                Omit<Slot, 'events'>,
                Omit<Slot, 'id' | 'events'>
            >({
                query: (slot) => ({
                    url: routeSwitcher('slot.store'),
                    method: 'POST',
                    body: slot,
                }),
                invalidatesTags: (res, err, arg) =>
                    err ? [] : [{ type: 'Slot', id: 'LIST' }],
            }),

            deleteSlot: builder.mutation<
                Omit<Slot, 'events'>,
                Pick<Slot, 'id'>
            >({
                query: (slotId) => ({
                    url: routeSwitcher('slot.destroy', { slotId }),
                    method: 'DELETE',
                }),
            }),

            updateSlot: builder.mutation<Omit<Slot, 'events'>, Slot>({
                query: (slot) => ({
                    url: routeSwitcher('slot.update', { slotId: slot.id }),
                    method: 'PUT',
                    body: slot,
                }),
                invalidatesTags: (res, err, { id }) =>
                    err
                        ? []
                        : [
                              { type: 'Slot', id },
                              { type: 'Slot', id: 'LIST' },
                              { type: 'Event', id: `LIST${id}` },
                          ],
            }),

            clearCache: builder.mutation<void, void>({
                query: () => ({
                    url: routeSwitcher('cacheclear'),
                    method: 'POST',
                }),
                invalidatesTags: ['Event', 'Slot', 'EventParticipants', 'User'],
            }),
            createPermission: builder.mutation<Permission, Permission>({
                query: (data) => ({
                    url: routeSwitcher('permission.store'),
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: (res, err, arg) =>
                    err
                        ? []
                        : arg.event_id
                        ? [
                              { type: 'User', id: arg.user_id },
                              { type: 'Event', id: arg.event_id },
                          ]
                        : [{ type: 'User', id: arg.user_id }],
            }),
            deletePermission: builder.mutation<void, Permission>({
                query: (data) => ({
                    url: routeSwitcher('permission.delete'),
                    method: 'DELETE',
                    body: data,
                }),
                invalidatesTags: (res, err, arg) =>
                    err
                        ? []
                        : arg.event_id
                        ? [
                              { type: 'User', id: arg.user_id },
                              { type: 'Event', id: arg.event_id },
                          ]
                        : [{ type: 'User', id: arg.user_id }],
            }),
            dumpState: builder.mutation<
                void,
                { key: string | undefined; dump: Object }
            >({
                query: ({ key, dump }) => ({
                    url: routeSwitcher('debug.dump'),
                    method: 'POST',
                    body: {
                        key: key,
                        dump: JSON.stringify(dump),
                    },
                }),
            }),
            createUser: builder.mutation<
                User,
                Omit<User, 'id' | 'activity' | 'teams'>
            >({
                query: (data) => ({
                    url: routeSwitcher('users.store'),
                    method: 'POST',
                    body: data,
                }),
                invalidatesTags: (res, err, arg) =>
                    err || !res
                        ? []
                        : [
                              { type: 'User', id: res.id },
                              { type: 'User', id: 'LIST' },
                          ],
            }),
            updateUser: builder.mutation<
                User,
                Omit<User, 'activity' | 'teams'>
            >({
                query: (data) => ({
                    url: routeSwitcher('users.update', { userId: data.id }),
                    method: 'PUT',
                    body: data,
                }),
                invalidatesTags: (res, err, arg) =>
                    err || !res
                        ? []
                        : [
                              { type: 'User', id: res.id },
                              { type: 'User', id: 'LIST' },
                          ],
            }),
        }),
    })

export default adminAPI

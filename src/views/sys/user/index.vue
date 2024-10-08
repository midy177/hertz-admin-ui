<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> {{ t('sys.user.addUser') }} </a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'bx:log-out-circle',
                color: 'error',
                popConfirm: {
                  title: t('sys.user.forceLoggingOut') + '?',
                  placement: 'left',
                  confirm: handleLogout.bind(null, record),
                },
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                popConfirm: {
                  title: t('common.deleteConfirm'),
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <UserDrawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useUserStore } from '/@/store/modules/user';

  import { useDrawer } from '/@/components/Drawer';
  import UserDrawer from './UserDrawer.vue';
  import { useI18n } from 'vue-i18n';

  import { columns, searchFormSchema } from './user.data';
  import { getUserList, deleteUser } from '/@/api/sys/user';
  import { useRoleStore } from '/@/store/modules/role';
  import { logout } from '/@/api/sys/token';

  export default defineComponent({
    name: 'UserManagement',
    components: { BasicTable, UserDrawer, TableAction },
    setup() {
      const { t } = useI18n();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const roleStoreData = useRoleStore();
      const userStore = useUserStore();

      // get role data
      roleStoreData.getRoleInfoFromServer();

      const [registerTable, { reload }] = useTable({
        title: t('sys.user.userList'),
        api: getUserList,
        columns,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
        },
        useSearchForm: true,
        showTableSetting: true,
        bordered: true,
        showIndexColumn: false,
        actionColumn: {
          width: 30,
          title: t('common.action'),
          dataIndex: 'action',
          fixed: undefined,
        },
      });

      function handleCreate() {
        openDrawer(true, {
          isUpdate: false,
        });
      }

      function handleEdit(record: Recordable) {
        openDrawer(true, {
          record,
          isUpdate: true,
        });
      }

      async function handleDelete(record: Recordable) {
        const result = await deleteUser({ ID: record.ID }, 'modal');
        if (result.statusCode === 0) {
          message.success(result.statusMsg, 3);
          await reload();
        } else {
          message.error(result.statusMsg);
        }
      }

      async function handleLogout(record: Recordable) {
        await logout(record.UUID);
        userStore.confirmLoginOut();
      }

      function handleSuccess() {
        reload();
      }

      return {
        t,
        registerTable,
        registerDrawer,
        handleCreate,
        handleEdit,
        handleLogout,
        handleDelete,
        handleSuccess,
      };
    },
  });
</script>

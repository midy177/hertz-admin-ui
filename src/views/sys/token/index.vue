<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Button type="primary" danger v-if="showDeleteButton" @click="handleBatchDelete()">
          {{ t('common.delete') }}
        </Button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <TableAction
            :actions="[
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
  </div>
</template>
<script lang="ts">
  import { createVNode, defineComponent, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { Button, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue/lib/icons';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useI18n } from 'vue-i18n';
  import { columns, searchFormSchema } from './token.data';
  import { batchDeleteToken, deleteToken, getTokenList } from '/@/api/sys/token';

  export default defineComponent({
    name: 'TokenManagement',
    components: { BasicTable, TableAction, Button },
    setup() {
      const { t } = useI18n();
      const selectedIds = ref<number[] | string[]>();
      const showDeleteButton = ref<boolean>(false);

      const [registerTable, { reload }] = useTable({
        title: t('sys.token.tokenList'),
        api: getTokenList,
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
        rowKey: 'id',
        rowSelection: {
          type: 'checkbox',
          onChange: (selectedRowKeys, _selectedRows) => {
            selectedIds.value = selectedRowKeys;
            if (selectedRowKeys.length > 0) {
              showDeleteButton.value = true;
            } else {
              showDeleteButton.value = false;
            }
          },
        },
      });

      async function handleDelete(record: Recordable) {
        const result = await deleteToken({ ID: record.ID }, 'modal');
        if (result.statusCode === 0) {
          message.success(result.statusMsg, 3);
          await reload();
        } else {
          message.error(result.statusMsg);
        }
      }

      async function handleBatchDelete() {
        Modal.confirm({
          title: t('common.deleteConfirm'),
          icon: createVNode(ExclamationCircleOutlined),
          async onOk() {
            const result = await batchDeleteToken({ ids: selectedIds.value as number[] }, 'modal');
            if (result.statusCode === 0) {
              await reload();
              showDeleteButton.value = false;
            }
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      }

      function handleSuccess() {
        reload();
      }

      return {
        t,
        registerTable,
        handleDelete,
        handleSuccess,
        handleBatchDelete,
        showDeleteButton,
      };
    },
  });
</script>

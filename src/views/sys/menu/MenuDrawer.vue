<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="50%"
    @ok="handleSubmit"
  >
    <template v-if="isUpdate" #extra>
      <a-button type="primary" style="margin-right: 8px" @click="handleOpenModal">
        {{ t('sys.menu.menuParamManagement') }}</a-button
      >
    </template>
    <BasicForm @register="registerForm" />
  </BasicDrawer>
  <Modal
    v-model:visible="modalVisible"
    :title="t('sys.menu.paramList')"
    width="50%"
    wrap-class-name="full-modal"
  >
    <template #footer>
      <Button type="primary" @click="handleOpenParamForm">{{ t('sys.menu.addMenuParam') }}</Button>
    </template>
    <Table
      :columns="extraParamColumns"
      :row-key="(record) => record.id"
      :pagination="false"
      :data-source="dataSource"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <TableAction
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                onClick: handleEdit.bind(null, record),
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
    </Table>
  </Modal>
  <Modal
    v-model:visible="paramFormVisible"
    :title="paramFormTitle"
    width="50%"
    wrap-class-name="full-modal"
    :footer="null"
  >
    <div class="paramForm">
      <Form
        :model="formdata"
        name="basic"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @submit="handleParamSubmit()"
      >
        <FormItem label="ID" name="id" v-show="false">
          <a-input v-model:value="formdata.id"
        /></FormItem>

        <FormItem :label="t('sys.menu.paramType')" name="dataType" :rules="[{ required: true }]">
          <Select ref="select" v-model:value="formdata.dataType" style="width: 120px">
            <SelectOption value="string">String</SelectOption>
            <SelectOption value="json">JSON</SelectOption>
          </Select>
        </FormItem>

        <FormItem :label="t('sys.menu.paramKey')" name="key" :rules="[{ required: true }]">
          <a-input v-model:value="formdata.key"
        /></FormItem>

        <FormItem :label="t('sys.menu.paramValue')" name="value" :rules="[{ required: true }]">
          <a-input v-model:value="formdata.value"
        /></FormItem>

        <FormItem :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit">{{ t('common.saveText') }}</a-button>
        </FormItem>
      </Form>
    </div>
  </Modal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref, reactive } from 'vue';
  import { Modal, Table, Button, Form, FormItem, Select, SelectOption } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { extraParamColumns, formSchema, paramFormData } from './menu.data';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { TableAction } from '/@/components/Table';
  import { useI18n } from 'vue-i18n';
  import {
    getAllMenu,
    CreateOrAddMenu,
    createOrUpdateMenu,
    deleteMenuParam,
    getMenuParamListByMenuId,
    createOrUpdateMenuParam,
  } from '/@/api/sys/menu';
  import { CreateOrUpdateMenuReq, MenuListItem, MenuParamInfo } from '/@/api/sys/model/menuModel';

  export default defineComponent({
    name: 'MenuDrawer',
    components: {
      BasicDrawer,
      BasicForm,
      Modal,
      Table,
      Button,
      TableAction,
      Form,
      FormItem,
      Select,
      SelectOption,
    },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const isUpdate = ref(true);
      const { t } = useI18n();
      const menuId = ref<number>(0);
      const dataSource = ref<MenuParamInfo[]>([]);
      const modalVisible = ref<boolean>(false);
      const paramFormTitle = ref<string>('');
      // form model for menu parameters creating and updating
      const formData = reactive<paramFormData>({
        id: 0,
        menuId: 0,
        dataType: 'string',
        key: '',
        value: '',
      });
      const paramFormVisible = ref<boolean>(false);

      function handleOpenParamForm() {
        modalVisible.value = false;
        formData.id = 0;
        formData.key = '';
        formData.value = '';
        formData.dataType = 'string';
        paramFormVisible.value = true;
      }

      async function handleOpenModal() {
        const values = await validate();
        let menuId: number = unref(isUpdate) ? Number(values['ID']) : 0;
        const result = await getMenuParamListByMenuId({ ID: menuId });
        dataSource.value = result.data.data;
        paramFormTitle.value = t('sys.menu.addMenuParam');
        formData.menuId = menuId;
        modalVisible.value = true;
      }

      // menu parameters operations
      function handleEdit(record: Recordable) {
        formData.id = record.id;
        formData.key = record.key;
        formData.value = record.value;
        formData.dataType = record.dataType;
        paramFormTitle.value = t('sys.menu.editMenuParam');
        paramFormVisible.value = true;
      }

      async function handleDelete(record: Recordable) {
        const result = await deleteMenuParam({ ID: record.id }, 'modal');
        if (result.statusCode === 0) await handleOpenModal();
      }

      async function handleParamSubmit() {
        const result = await createOrUpdateMenuParam({
          id: formData.id,
          menuId: formData.menuId,
          dataType: formData.dataType,
          value: formData.value,
          key: formData.key,
        });
        if (result.statusCode === 0) {
          paramFormVisible.value = false;
          await handleOpenModal();
        }
      }

      const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
        labelWidth: 100,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: { lg: 12, md: 24 },
      });

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        await resetFields();
        setDrawerProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;

        if (unref(isUpdate)) {
          await setFieldsValue({
            ...data.record,
          });
        }

        if ('record' in data) {
          menuId.value = data.record.id;
        }

        // get tree data from data.data
        let treeData = await getAllMenu().then((resp) => {
          return resp.data.data;
        });

        treeData.push({
          level: 0,
          name: 'root',
          ID: 1,
          menuType: 0,
          parentID: 1,
          path: '',
          redirect: '',
          component: '',
          orderNo: 0,
          disabled: false,
          children: [],
          meta: {
            title: 'sys.menu.rootMenu',
            icon: '',
            hideMenu: false,
            hideBreadcrumb: false,
            currentActiveMenu: '',
            ignoreKeepAlive: false,
            hideTab: false,
            frameSrc: '',
            carryParam: false,
            hideChildrenInMenu: false,
            affix: false,
            dynamicLevel: 0,
            realPath: '',
          },
        });

        const travel = function (data: MenuListItem[]): MenuListItem[] {
          if (data.length === 0) {
            return data;
          }
          for (let i = 0; i < data.length; i++) {
            data[i].name = t(data[i].name);
            if (data[i].children !== null) {
              data[i].children = travel(data[i].children);
            }
          }
          return data;
        };

        treeData = travel(treeData);
        await updateSchema({
          field: 'parentID',
          //   componentProps: {
          //   options: roleOptionData(treeData, 0),
          // },
          componentProps: { treeData },
        });
      });

      const getTitle = computed(() =>
        !unref(isUpdate) ? t('sys.menu.addMenu') : t('sys.menu.editMenu'),
      );

      async function handleSubmit() {
        const values = await validate();
        setDrawerProps({ confirmLoading: true });
        // defined the component
        let componentValue: string;
        if (values.isExt === '1') {
          componentValue = 'IFrame';
        } else if (values.type === 0) {
          componentValue = 'LAYOUT';
        } else {
          componentValue = values['component'];
        }
        // defined the parent id
        let parentId: number = values['parentID'] ? Number(values['parentID']) : 0;
        // defined menu id
        let menuId: number = unref(isUpdate) ? Number(values['ID']) : 0;

        //  let menuId: number;
        // if (unref(isUpdate)) {
        //   menuId = Number(values['ID']);
        // } else {
        //   menuId = 0;

        // }
        let params: CreateOrUpdateMenuReq = {
          ID: menuId,
          menuType: values['menuType'],
          level: values['dynamicLevel'],
          parentID: parentId,
          path: values['path'] == undefined ? '' : values['path'],
          name: values['name'],
          redirect: values['redirect'] == undefined ? '' : values['redirect'],
          component: componentValue,
          orderNo: values['orderNo'],
          disabled: values['disabled'],
          meta: {
            title: values['meta.title'],
            icon: values['meta.icon'],
            hideMenu: values['meta.hideMenu'],
            hideBreadcrumb:
              values['meta.hideBreadcrumb'] == undefined ? true : values['meta.hideBreadcrumb'],
            currentActiveMenu:
              values['meta.currentActiveMenu'] == undefined ? '' : values['meta.currentActiveMenu'],
            ignoreKeepAlive:
              values['meta.ignoreKeepAlive'] == undefined ? false : values['meta.ignoreKeepAlive'],
            hideTab: values['meta.hideTab'] == undefined ? false : values['meta.hideTab'],
            frameSrc: values['meta.frameSrc'] == undefined ? '' : values['meta.frameSrc'],
            carryParam: values['meta.carryParam'] == undefined ? false : values['meta.carryParam'],
            hideChildrenInMenu: values['meta.hideChildrenInMenu'],
            affix: values['meta.affix'] == undefined ? false : values['meta.affix'],
            dynamicLevel: values['meta.dynamicLevel'],
            realPath: values['meta.realPath'] == undefined ? '' : values['meta.realPath'],
          },
        };
        if (params.ID === 0) {
          const result = await CreateOrAddMenu(params);
          if (result.statusCode === 0) {
            closeDrawer();
            emit('success');
          } else {
            setDrawerProps({ confirmLoading: false });
          }
          return;
        }
        const result = await createOrUpdateMenu(params);
        if (result.statusCode === 0) {
          closeDrawer();
          emit('success');
        } else {
          setDrawerProps({ confirmLoading: false });
        }
      }

      return {
        t,
        isUpdate,
        registerDrawer,
        registerForm,
        getTitle,
        handleSubmit,
        extraParamColumns,
        handleEdit,
        handleDelete,
        handleOpenModal,
        modalVisible,
        dataSource,
        formdata: formData,
        paramFormVisible,
        handleOpenParamForm,
        paramFormTitle,
        handleParamSubmit,
      };
    },
  });
</script>
<style scoped>
  .paramForm {
    padding: 1em;
  }
</style>

import {
  DatePicker,
  Checkbox,
  CheckboxGroup,
  Tag,
  Alert,
  Button,
  ColorPicker,
  Tabs,
  TabPane,
  Table,
  Card,
  InputNumber,
  Form,
  FormItem,
  Input,
  Notice,
  Menu,
  MenuItem,
  MenuGroup,
  Submenu,
  Icon,
  Row,
  Col,
  Upload,
  Breadcrumb,
  BreadcrumbItem,
  Divider,
  Drawer,
  Switch,
  Poptip,
  Modal,
  RadioGroup,
  Radio,
  Page,
  Select,
  Option,
  Spin,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  AutoComplete
} from 'view-design'
import SectionCard from './SectionCard/'
import '../assets/less/theme.less'
export default {
  install(Vue) {
    Vue.component('DatePicker', DatePicker)
    Vue.component('Checkbox', Checkbox)
    Vue.component('CheckboxGroup', CheckboxGroup)
    Vue.component('Tag', Tag)
    Vue.component('Alert', Alert)
    Vue.component('Button', Button)
    Vue.component('ColorPicker', ColorPicker)
    Vue.component('Table', Table)
    Vue.component('Tabs', Tabs)
    Vue.component('TabPane', TabPane)
    Vue.component('Card', Card)
    Vue.component('InputNumber', InputNumber)
    Vue.component('Form', Form)
    Vue.component('FormItem', FormItem)
    Vue.component('Input', Input)
    Vue.component('Menu', Menu)
    Vue.component('MenuItem', MenuItem)
    Vue.component('MenuGroup', MenuGroup)
    Vue.component('Submenu', Submenu)
    Vue.component('Icon', Icon)
    Vue.component('Row', Row)
    Vue.component('Col', Col)
    Vue.component('Upload', Upload)
    Vue.component('Breadcrumb', Breadcrumb)
    Vue.component('BreadcrumbItem', BreadcrumbItem)
    Vue.component('Divider', Divider)
    Vue.component('Drawer', Drawer)
    Vue.component('iSwitch', Switch)
    Vue.component('Poptip', Poptip)
    Vue.component('RadioGroup', RadioGroup)
    Vue.component('Radio', Radio)
    Vue.component('Modal', Modal)
    Vue.component('Page', Page)
    Vue.component('Select', Select)
    Vue.component('Option', Option)
    Vue.component('Spin', Spin)
    Vue.component('DropdownMenu', DropdownMenu)
    Vue.component('Dropdown', Dropdown)
    Vue.component('DropdownItem', DropdownItem)
    Vue.component('AutoComplete', AutoComplete)
    Vue.prototype.$Notice = Notice
    Vue.prototype.$Modal = Modal

    Vue.component('SectionCard', SectionCard)
  }
}

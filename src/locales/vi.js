import ads from './vi-Vn/ads';
import adsPosition from './vi-Vn/adsPosition';
import adsType from './vi-Vn/adsType';
import category from './vi-Vn/category';
import groupPlace from './vi-Vn/groupPlace';
import groupSite from './vi-Vn/groupSite';
import groupUser from './vi-Vn/groupUser';
import languages from './vi-Vn/languages';
import menu from './vi-Vn/menu';
import menuPosition from './vi-Vn/menuPosition';
import site from './vi-Vn/site';
import siteProfile from './vi-Vn/siteProfile';
import template from './vi-Vn/template';
import templateGroups from './vi-Vn/templateGroups';
import templateLayout from './vi-Vn/templateLayout';
import templateLayoutTemplates from './vi-Vn/templateLayoutTemplates';
import user from './vi-Vn/user';
import article from './vi-Vn/article';
import province from './vi-Vn/province';
import district from './vi-Vn/district';
import ward from './vi-Vn/ward';
import villages from './vi-Vn/villages';
import userTokens from './vi-Vn/userTokens';
//
import courseTypes from './vi-Vn/courseTypes';
import courseGroups from './vi-Vn/courseGroups';
import courseLevels from './vi-Vn/courseLevels';
import courses from './vi-Vn/courses';
import exercises from './vi-Vn/exercises';
import questions from './vi-Vn/questions';
import questionSuggestions from './vi-Vn/questionSuggestions';
import purchasedCourseGroups from './vi-Vn/purchasedCourseGroups';
import notifications from './vi-Vn/notifications';
import bankAccounts from './vi-Vn/bankAccounts';
import bankAccountTypes from './vi-Vn/bankAccountTypes';
import banners from './vi-Vn/banners';
import courseGroupsPackages from './vi-Vn/courseGroupsPackages';
import configs from './vi-Vn/configs';
import services from './vi-Vn/services';
import contents from './vi-Vn/contents';
import contentGroups from './vi-Vn/contentGroups';

export default {
  // thông tin chung//
  locations: 'Địa điểm',
  token: 'Mã bảo mật',
  dateUpdated: 'Ngày cập nhật',
  createDate: 'Ngày tạo',
  dateCreated: 'Ngày tạo',
  isDelete: 'Trạng thái xóa',
  id: 'id',
  email: 'Email',
  name: 'Tên',
  images: 'Ảnh',
  width: 'Rộng',
  height: 'Dài',

  imagesResize: 'Tham số resize ảnh',
  address: 'Địa chỉ',
  mobile: 'Số điện thoại',
  placesId: 'ID cơ sở y tế',
  adsPositions: 'Vị trí quảng cáo',
  menus: 'Menu',
  orderBy: 'Thứ tự',
  orderHome: 'Thứ tự trang chính',
  users: 'Tài khoản',
  points: 'tọa độ polygon',
  provincesId: 'id thành phố',
  districtsId: 'id huyện',
  menuPositions: 'Vị trí menu',
  notes: 'Ghi chú',
  openShedules: 'Lịch mở cửa',
  places: 'Cơ sở y tế',
  chatbox: 'Embed Script Tawk to',
  placesUsers: 'Cơ sở y tế và tài khoản',

  sites: 'Website',
  groupSites: 'Nhóm website',

  groupPlaces: 'Nhóm cơ sở y tế',
  adsType: 'Loại quảng cáo',
  ads: 'Quảng cáo',
  categories: 'Danh mục',
  type: 'Kiểu danh mục',
  templateLayouts: 'Giao diện danh mục',
  templates: 'Thư viện giao diện',
  templateGroupsId: 'Id nhóm thư viện giao diện',
  groupsUsers: 'Nhóm tài khoản',
  groupUser: 'Nhóm tài khoản',
  groupUsers: 'Nhóm tài khoản',

  usersCreatorId: 'Người tạo',
  usersId: 'Người quản lý',
  status: 'Trạng thái',

  FromDate: 'Ngày bắt đầu tìm kiếm',
  ToDate: 'Ngày kết thúc tìm kiếm',
  sitesId: 'Id website',
  shippingCompanyId: 'Id công ty vận chuyển',
  logo: 'Logo',
  icon: 'icon',
  flag: 'Flag xoá/thêm-sửa',
  groupByPackages: 'Nhóm gói dịch vụ tiêm',
  referralSocial: 'Kênh mạng xã hội đăng ký',

  groupPlacesId: 'Id nhóm cơ sở y tế',
  menuPositionsId: 'Id vị trí Menu',
  menusId: 'Id menu',
  groupsUsersId: 'Id nhóm tài khoản',
  groupUserId: 'Id nhóm tài khoản',
  usersDoctorId: 'Id bác sĩ phụ trách',
  groupUsersId: 'Id nhóm tài khoản',
  templatesId: 'Id thư viện giao diện',
  groupSitesId: 'Id nhóm website',
  seoKeywords: 'Từ khóa SEO',
  seoDescriptions: 'Mô tả SEO',
  UrlSlugs: 'Url Slugs SEO',
  adsTypeId: 'ID loại quảng cáo',
  adsPositionsId: 'ID vị trí quảng cáo',
  adsId: 'Id quảng cáo',
  categoriesId: 'ID danh mục',

  templateLayoutsId: 'ID thư viện giao diện danh mục',
  medicineLocationsId: 'Id vị trí thuốc',

  addressHere: 'Địa chỉ map',
  userCreatorsId: 'Người tạo',
  descriptions: 'Mô tả - ghi chú',

  typesId: 'Loại',
  wardsId: 'Id xã',
  excludedId: 'Id ngoại lệ',
  parentId: 'id bản ghi cấp trên',
  'api.message.infoError': 'Lấy thông tin xác thực thất bại!',
  'api.message.infoAfterCreateError': 'Lỗi không lấy được bản ghi mới sau khi tạo thành công',
  'api.message.infoAfterEditError': 'Lấy thông tin sau khi thay đổi thất bại',
  'api.message.notExisted': 'Bản ghi này không tồn tại!',
  'api.servicePackages.featureName': 'Tên tính năng',

  ...menuPosition,
  ...menu,
  ...site,
  ...templateGroups,
  ...template,
  ...templateLayout,
  ...user,

  ...ads,
  ...adsPosition,
  ...adsType,

  ...category,
  ...groupPlace,
  ...groupSite,
  ...groupUser,
  ...templateLayoutTemplates,
  ...siteProfile,
  ...languages,
  ...article,
  ...province,
  ...district,
  ...ward,
  ...villages,
  ...userTokens,
  //
  ...courseGroups,
  ...courseLevels,
  ...courses,
  ...exercises,
  ...questions,
  ...questionSuggestions,
  ...courseTypes,
  ...purchasedCourseGroups,
  ...notifications,
  ...bankAccountTypes,
  ...bankAccounts,
  ...banners,
  ...courseGroupsPackages,
  ...configs,
  ...services,
  ...contents,
  ...contentGroups
};

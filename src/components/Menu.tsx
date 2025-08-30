import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonAvatar,
  IonButton
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { 
  archiveOutline, 
  archiveSharp, 
  bookmarkOutline, 
  heartOutline, 
  heartSharp, 
  mailOutline, 
  mailSharp, 
  paperPlaneOutline, 
  paperPlaneSharp, 
  trashOutline, 
  trashSharp, 
  warningOutline, 
  warningSharp,
  carOutline,
  personOutline,
  logOutOutline
} from 'ionicons/icons';
import { useLogin } from './Store/useLogin';
import './Menu.css';

import { Truck } from 'lucide-react'


interface AppPage {
  url:      string;
  iosIcon:  string;
  mdIcon:   string;
  title:    string;
  src:      any;
}


const appPages: AppPage[] = [
  {
    title:    'Cargos',
    url:      '/folder/Cargos',
    iosIcon:  mailOutline,
    mdIcon:   mailSharp,
    src:      <Truck className="w-1 h-1" size={32} />
  }
];

const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

const Menu: React.FC = () => {
  const location = useLocation();
  const { name, user_type, image, logout } = useLogin();

  // Определяем тип пользователя
  const getUserType = () => {
    switch (user_type) {
      case 1: return 'Водитель';
      case 2: return 'Заказчик';
      default: return 'Пользователь';
    }
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        
        {/* Логотип и название приложения */}
        <div className="menu-header">
          <div className="logo-container">
            <img src='gvrLogo.png' alt='logo' className="app-logo" />
            <h2 className="app-title">ГРУЗ В РЕЙС</h2>
          </div>
        </div>

        {/* Карточка пользователя */}
        <div className="user-card" data-user-type={user_type}>
          <div className="user-info">
            <IonAvatar className="user-avatar">
              {image ? (
                <img src={image} alt="Avatar" />
              ) : (
                <IonIcon icon={personOutline} className="avatar-placeholder" />
              )}
            </IonAvatar>
            <div className="user-details">
              <div className="user-name">{name || 'Пользователь'}</div>
              <div className="user-type">{getUserType()}</div>
            </div>
          </div>
        </div>

        {/* Основное меню */}
        <IonList id="inbox-list">
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem 
                  className={location.pathname === appPage.url ? 'selected' : ''} 
                  routerLink={appPage.url} 
                  routerDirection="none" 
                  lines="none" 
                  detail={false}
                >
                  
                  { appPage.src }

                  <IonLabel class='m-md'>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        {/* Дополнительные лейблы */}
        <IonList id="labels-list">
          <IonListHeader>Labels</IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon aria-hidden="true" slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
        
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
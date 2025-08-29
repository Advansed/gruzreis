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

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Inbox',
    url: '/folder/Inbox',
    iosIcon: mailOutline,
    mdIcon: mailSharp
  },
  {
    title: 'Outbox',
    url: '/folder/Outbox',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp
  },
  {
    title: 'Favorites',
    url: '/folder/Favorites',
    iosIcon: heartOutline,
    mdIcon: heartSharp
  },
  {
    title: 'Archived',
    url: '/folder/Archived',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp
  },
  {
    title: 'Trash',
    url: '/folder/Trash',
    iosIcon: trashOutline,
    mdIcon: trashSharp
  },
  {
    title: 'Spam',
    url: '/folder/Spam',
    iosIcon: warningOutline,
    mdIcon: warningSharp
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
            <IonIcon icon={carOutline} className="app-logo" />
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
          <IonButton 
            fill="clear" 
            size="small" 
            className="logout-button"
            onClick={logout}
          >
            <IonIcon icon={logOutOutline} />
          </IonButton>
        </div>

        {/* Основное меню */}
        <IonList id="inbox-list">
          <IonListHeader>Inbox</IonListHeader>
          <IonNote>hi@ionicframework.com</IonNote>
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
                  <IonIcon 
                    aria-hidden="true" 
                    slot="start" 
                    ios={appPage.iosIcon} 
                    md={appPage.mdIcon} 
                  />
                  <IonLabel>{appPage.title}</IonLabel>
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
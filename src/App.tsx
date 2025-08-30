import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';
import { ServerConnectionGuard } from './components/ServerConnectionGuard/ServerConnectionGuard';
import { ToastProvider } from './components/Toast';
import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus';
import Login from './components/Login/Login';
import { useLogin } from './components/Store/useLogin';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './App.css'

/* Ionic Dark Mode */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AppContent: React.FC = () => {
  const { auth } = useLogin();

  return (
    <ServerConnectionGuard>
      {auth ? (
        <IonReactRouter>
          <IonSplitPane contentId="main">
            <Menu />
            <IonRouterOutlet id="main">
              <Route path="/" exact={true}>
                <Redirect to="/folder/Cargos" />
              </Route>
              <Route path="/folder/:name" exact={true}>
                <Page />
              </Route>
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      ) : (
        <Login />
      )}
      <ConnectionStatus />
    </ServerConnectionGuard>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </IonApp>
  );
};

export default App;
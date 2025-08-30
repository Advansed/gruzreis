import React from 'react';
import { IonIcon, IonText } from '@ionic/react';
import { locationOutline, calendarOutline } from 'ionicons/icons';
import { CargoInfo } from '../types';
import { formatters, statusUtils } from '../utils';

interface CargoCardProps {
    cargo: CargoInfo;
    mode?: 'view' | 'list';
    onClick?: () => void;
}

export const CargoCard: React.FC<CargoCardProps> = ({ 
    cargo, 
    mode = 'list',
    onClick 
}) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    if (mode === 'view') {
        return (
            <div className="cargo-card-view">
                {/* Статус и ID */}
                <div className="flex fl-space">
                    <div className="flex">
                        <div className={statusUtils.getClassName(cargo.status)}>
                            {cargo.status}
                        </div>
                        <IonText className="ml-1 fs-07 cl-black">
                            {"ID: " + formatters.shortId(cargo.guid)}
                        </IonText>
                    </div>
                    <div>
                        <IonText className="fs-09 cl-prim">
                            <b>{formatters.currency(cargo.price)}</b>
                        </IonText>
                        <div className="fs-08 cl-black">
                            <b>{formatters.weight(cargo.weight, cargo.weight1)}</b>
                        </div>
                    </div>
                </div>

                {/* Название груза */}
                <div className="fs-08 mt-05 cl-black">
                    <b>{cargo.name}</b>
                </div>

                {/* Маршрут отправления */}
                <div className="flex fl-space mt-05 cl-black">
                    <div className="flex">
                        <IonIcon icon={locationOutline} color="danger"/>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Откуда:</div>
                            <div className="ml-1 fs-09">
                                <b>{cargo.address?.city.city || 'Не указано'}</b>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Дата загрузки:</div>
                            <div className="ml-1 fs-09">
                                <b>{formatters.date(cargo.pickup_date || '')}</b>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Маршрут назначения */}
                <div className="flex fl-space mt-05">
                    <div className="flex">
                        <IonIcon icon={locationOutline} color="success"/>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Куда:</div>
                            <div className="ml-1 fs-09">
                                <b>{cargo.destiny?.city.city || 'Не указано'}</b>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="fs-08 cl-prim">
                            <div className="ml-1 fs-09 cl-gray">Дата выгрузки:</div>
                            <div className="ml-1 fs-09">
                                <b>{formatters.date(cargo.delivery_date || '')}</b>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Описание груза */}
                {cargo.description && (
                    <div className="fs-08 mt-1 cr-detali">
                        <b>Детали груза:</b>
                        <div>{cargo.description}</div>
                    </div>
                )}
            </div>
        );
    }

    // Режим для списка (компактный)
    return (
        <div 
            className="cr-card mt-1 cargo-card-list"
            onClick={handleClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {/* Верхняя строка: статус, ID, цена */}
            <div className="flex fl-space">
                <div className="flex">
                    <div className={statusUtils.getClassName(cargo.status)}>
                        {cargo.status}
                    </div>
                    <IonText className="ml-1 fs-07 cl-black">
                        {"ID: " + formatters.shortId(cargo.guid)}
                    </IonText>
                </div>
                <div className="text-right">
                    <IonText className="fs-09 cl-prim">
                        <b>{formatters.currency(cargo.price)}</b>
                    </IonText>
                    <div className="fs-08 cl-black">
                        <b>{formatters.weight(cargo.weight, cargo.weight1)}</b>
                    </div>
                </div>
            </div>

            {/* Название груза */}
            <div className="fs-08 mt-05 cl-black">
                <b>{cargo.name}</b>
            </div>

            {/* Маршрут в одну строку */}
            <div className="flex mt-05 cl-black">
                <IonIcon icon={locationOutline} color="danger" className="mr-05"/>
                <div className="fs-08 cl-prim flex-1">
                    <b>{cargo.address?.city.city || 'Не указано'}</b>
                </div>
                <div className="fs-08 cl-gray mx-1">→</div>
                <div className="fs-08 cl-prim flex-1">
                    <b>{cargo.destiny?.city.city || 'Не указано'}</b>
                </div>
                <IonIcon icon={locationOutline} color="success" className="ml-05"/>
            </div>

            {/* Даты */}
            <div className="flex mt-05 cl-gray">
                <IonIcon icon={calendarOutline} className="mr-05"/>
                <div className="fs-08 flex-1">
                    {formatters.date(cargo.pickup_date || '')}
                </div>
                <div className="fs-08 mx-1">-</div>
                <div className="fs-08 flex-1">
                    {formatters.date(cargo.delivery_date || '')}
                </div>
            </div>

            {/* Дополнительная информация */}
            <div className="flex mt-05 cl-gray fs-08">
                <div className="flex-1">
                    Объем: {formatters.volume(cargo.volume)}
                </div>
                {cargo.invoices && cargo.invoices.length > 0 && (
                    <div className="flex-1 text-right">
                        Предложений: {cargo.invoices.length}
                    </div>
                )}
            </div>
        </div>
    );
};
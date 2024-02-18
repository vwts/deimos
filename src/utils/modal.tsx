import {
    waitFor
} from '../webpack';

import Components from 'discord-types/components';

let Modal: Components.Modal;
let modals: any;

waitFor("openModalLazy", m => modals= m);
waitFor("ModalRoot", m => Modal = m);

let modalId = 1337;

/**
 * abre um modal
 * 
 * @param Component o componente a ser renderizado no modal
 * 
 * @returns a chave desse modal. pode ser utilizada para fechar o modal depois com closemodal
 */
export function openModal(Component: React.ComponentType) {
    let key = `Deimos${modalId++}`;

    modals.openModal(props =>
        <Modal.ModalRoot {...props}>
            <Component />
        </Modal.ModalRoot>, {
            modalKey: key
        });

    return key;
};

/**
 * fecha um modal pela chave. o id necessário é fornecido pelo openmodal.
 * 
 * @param key a chave do modal para fechá-lo
 */
export function closeModal(key: string) {
    modals.closeModal(key);
}
import {
    REACT_GLOBAL
} from '../utils/constants';

import {
    Modal,
    openModal
} from '../utils/modal';

import {
    filters,
    waitFor
} from '../webpack';

import definePlugin from '../utils/types';

let ImageModal: any;
let renderMaskedLink: any;

waitFor(filters.byDisplayName("ImageModal"), m => ImageModal = m.default);
waitFor("renderMaskedLinkComponent", m => renderMaskedLink = m.renderMaskedLinkComponent);

const OPEN_URL = "Deimos.Plugins.plugins.ViewIcons.openImage(";

export default definePlugin({
    name: "viewicons",
    description: "faz dos avatares/banners dos usuários, clicáveis, e adiciona entradas de menu de contexto para servidores para ver banner/ícone. (crasha se você não possuir o modo desenvolvedor ativado, correção em breve).",
    author: "vuwints",

    openImage(url: string) {
        openModal(() => (
            <ImageModal
                shouldAnimate={true}
                original={url}
                src={url}
                renderLinkComponent={renderMaskedLink}
            />
        ), {
            size: Modal.ModalSize.DYNAMIC
        });
    },

    patches: [
        {
            find: "UserProfileModalHeader",

            replacement: {
                match: /\{src:(.{1,2}),avatarDecoration/,

                replace: (_, src) => `{src:${src},onClick:()=>${OPEN_URL}${src}.replace(/\\?.+$/, "")+"?size=2048"),avatarDecoration`
            }
        },

        {
            find: "default.popoutNoBannerPremium",

            replacement: {
                match: /style:.{1,2}\(\{\},(.{1,2}),/,

                replace: (m, bannerObj) => `onClick:${bannerObj}.backgroundImage&&(()=>${OPEN_URL}${bannerObj}.backgroundImage.replace("url(", "").replace(/(\\?size=.+)?\\)/, "?size=2048"))),${m}`
            }
        },

        {
            find: "GuildContextMenuWrapper",

            replacement: [
                {
                    match: /\w=(\w)\.id/,

                    replace: (m, guild) => `_guild=${guild},${m}`
                },

                {
                    match: /,(.{1,2})\((.{1,2}\.MenuGroup),\{\},void 0,(.{1,2})\)(?=\)\}.{1,2}\.displayName)/,

                    replace: (_, factory, menuGroup, copyIdElement) => `,${factory}(${menuGroup},{},void 0,[` + `_guild.icon&&${REACT_GLOBAL}.cloneElement(${copyIdElement},` + `{key:"viewicons-copy-icon",id:"viewicons-copy-icon",action:()=>${OPEN_URL}_guild.getIconURL(undefined,true)+"size=2048"),label:"ver ícone",icon:null}),` + `_guild.banner&&${REACT_GLOBAL}.cloneElement(${copyIdElement},` + `{key:"viewicons-copy-banner",id:"viewicons-copy-banner",action:()=>${OPEN_URL}Deimos.Webpack.findByProps("getGuildBannerURL").getGuildBannerURL(_guild).replace(/\\?size=.+/, "?size=2048")),label:"ver banner",icon:null}),${copyIdElement}])`
                }
            ]
        }
    ]
});
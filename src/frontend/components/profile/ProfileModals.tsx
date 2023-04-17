import DeleteAccountModal from "./DeleteAccountModal";

function ProfileModals({isDeleteAccountModalOpen, setIsDeleteAccountModalOpen}) {
    return (
        <DeleteAccountModal
            isModalOpen={isDeleteAccountModalOpen}
            setIsModalOpen={setIsDeleteAccountModalOpen}
        />
    )
}

export default ProfileModals;
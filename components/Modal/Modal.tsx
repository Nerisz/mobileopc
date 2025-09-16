import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function Teste() {
  const [showModal, setShowModal] = useState(false);
  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <View className="justify-center items-center">
      <TouchableOpacity
        className="bg-red-500 p-4 rounded-2xl"
        onPress={openModal}
      >
        <Text className="text-white ">Editar Perfil</Text>
      </TouchableOpacity>
      <Modal
        className="bg-black"
        animationType="slide"
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center">
          <Text> Daporra </Text>
          <View>
            <TouchableOpacity
              className="bg-red-500 p-4 rounded-2xl"
              onPress={closeModal}
            >
              <Text className="text-white ">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
